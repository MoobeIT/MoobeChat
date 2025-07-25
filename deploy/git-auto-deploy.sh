#!/bin/bash

# 🚀 Script de Deploy Automático via Git
# Para Ubuntu AWS - MoobeChat

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Configurações
PROJECT_DIR="/var/www/moobeChat"
REPO_URL="https://github.com/MoobeIT/MoobeChat.git"
BRANCH="main"
IP="44.235.125.150"

echo "🚀 Deploy Automático MoobeChat via Git"
echo "========================================"

# 1. Verificar se é primeira instalação ou atualização
if [ ! -d "$PROJECT_DIR" ]; then
    log "🆕 Primeira instalação detectada"
    
    # Atualizar sistema
    log "📦 Atualizando sistema..."
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependências
    log "🔧 Instalando dependências..."
    sudo apt install git curl nginx -y
    
    # Instalar Node.js 18
    log "📦 Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install nodejs -y
    
    # Instalar PM2
    log "🔧 Instalando PM2..."
    sudo npm install -g pm2
    
    # Configurar firewall
    log "🔒 Configurando firewall..."
    sudo ufw allow 22
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
    
    # Criar diretório e clonar
    log "📁 Criando diretório do projeto..."
    sudo mkdir -p /var/www
    sudo chown $USER:$USER /var/www
    
    log "📥 Clonando repositório..."
    cd /var/www
    git clone $REPO_URL moobeChat
    cd moobeChat
    
else
    log "🔄 Atualização detectada"
    cd $PROJECT_DIR
    
    # Parar aplicação se estiver rodando
    if pm2 list | grep -q "moobeChat"; then
        log "⏹️  Parando aplicação..."
        pm2 stop moobeChat
    fi
    
    # Backup da configuração atual
    if [ -f ".env.local" ]; then
        log "💾 Fazendo backup da configuração..."
        cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Atualizar código
    log "📥 Atualizando código..."
    git stash  # Salvar mudanças locais
    git pull origin $BRANCH
fi

# 2. Configurar ambiente (apenas se não existir)
if [ ! -f ".env.local" ]; then
    log "⚙️  Configurando ambiente de produção..."
    cat > .env.local << EOF
# Supabase - ⚠️ CONFIGURE COM SEUS DADOS
NEXT_PUBLIC_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA-CHAVE-ANONIMA"
SUPABASE_SERVICE_ROLE_KEY="SUA-CHAVE-SERVICE-ROLE"

# NextAuth.js
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://$IP"

# UazAPI
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="B7teYpdEf9I9LM9IxDE5CUqmxF68P2LrwtF6NZ5eZu2oqqXz3r"
WEBHOOK_URL="http://$IP"

# Configurações
MOCK_DATA_ENABLED="false"
NODE_ENV="production"
EOF
    
    warn "⚠️  IMPORTANTE: Configure o arquivo .env.local com suas credenciais!"
    warn "   Edite: nano .env.local"
fi

# 3. Instalar dependências
log "📦 Instalando dependências..."
npm install

# Instalar dependências do MCP server
if [ -d "mcp-server" ]; then
    log "📦 Instalando dependências do MCP server..."
    cd mcp-server
    npm install
    cd ..
fi

# 4. Buildar aplicação
log "🔨 Buildando aplicação..."
npm run build

# 5. Configurar Nginx (apenas se não existir)
if [ ! -f "/etc/nginx/sites-available/moobeChat" ]; then
    log "🌐 Configurando Nginx..."
    sudo tee /etc/nginx/sites-available/moobeChat > /dev/null << EOF
server {
    listen 80;
    server_name $IP;

    # Logs
    access_log /var/log/nginx/moobeChat_access.log;
    error_log /var/log/nginx/moobeChat_error.log;

    # Proxy para aplicação Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Ativar configuração
    sudo ln -s /etc/nginx/sites-available/moobeChat /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
fi

# 6. Configurar PM2 (apenas se não existir)
if [ ! -f "ecosystem.config.js" ]; then
    log "⚙️  Configurando PM2..."
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'moobeChat',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/moobeChat-error.log',
    out_file: '/var/log/pm2/moobeChat-out.log',
    log_file: '/var/log/pm2/moobeChat-combined.log',
    time: true
  }]
};
EOF
fi

# Criar diretórios de log
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# 7. Iniciar/Reiniciar aplicação
log "🚀 Iniciando aplicação..."
if pm2 list | grep -q "moobeChat"; then
    pm2 restart moobeChat
else
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
fi

# 8. Verificações finais
log "🔍 Verificando serviços..."

# Verificar PM2
if pm2 list | grep -q "online"; then
    log "✅ PM2 está rodando"
else
    warn "⚠️  PM2 pode ter problemas"
fi

# Verificar Nginx
if sudo systemctl is-active --quiet nginx; then
    log "✅ Nginx está rodando"
else
    warn "⚠️  Nginx pode ter problemas"
fi

# Verificar aplicação
sleep 5
if curl -s http://localhost:3000 > /dev/null; then
    log "✅ Aplicação respondendo na porta 3000"
else
    warn "⚠️  Aplicação pode não estar respondendo"
fi

echo ""
echo "🎉 Deploy concluído!"
echo "==================="
info "🌐 Aplicação: http://$IP"
info "🔧 Logs: pm2 logs moobeChat"
info "📊 Status: pm2 status"
echo ""
info "📝 Próximos passos:"
echo "1. Configure .env.local com suas credenciais do Supabase"
echo "2. Teste a aplicação: curl http://$IP"
echo "3. Configure SSL (opcional): sudo certbot --nginx"
echo ""
info "🔄 Para futuras atualizações, execute novamente este script"