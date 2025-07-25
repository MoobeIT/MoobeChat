#!/bin/bash

# Deploy do MoobeChat no Ubuntu AWS
# Execute após fazer upload dos arquivos

set -e

PROJECT_DIR="/var/www/moobeChat"
IP="44.235.125.150"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[DEPLOY]${NC} $1"; }

echo "🚀 Deploy do MoobeChat - Ubuntu AWS"
echo "📍 IP: $IP"
echo "📁 Diretório: $PROJECT_DIR"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório do projeto!"
    exit 1
fi

info "1. Configurando variáveis de ambiente..."
if [ -f ".env.aws" ]; then
    cp .env.aws .env.local
    log "Arquivo .env.local configurado com IP: $IP"
else
    warn "Arquivo .env.aws não encontrado, usando configuração manual..."
    cat > .env.local << EOF
# Produção Ubuntu AWS - IP: $IP
DATABASE_URL="postgresql://postgres:LYBXKKXOZA9ewAHk@db.gnnazztjaeukllmnnxyj.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:LYBXKKXOZA9ewAHk@db.gnnazztjaeukllmnnxyj.supabase.co:5432/postgres"
SUPABASE_URL="https://gnnazztjaeukllmnnxyj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubmF6enRqYWV1a2xsbW5ueHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY4OTMsImV4cCI6MjA2Njk2Mjg5M30.XIS2x3K4rMiLaWQ8Nlrd-Aw8k_RHGkZjFdGTEpFrsyw"
NEXTAUTH_SECRET="moobi-chat-production-ubuntu-$(date +%s)"
NEXTAUTH_URL="http://$IP"
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="B7teYpdEf9I9LM9IxDE5CUqmxF68P2LrwtF6NZ5eZu2oqqXz3r"
WEBHOOK_URL="http://$IP"
MOCK_DATA_ENABLED="false"
NODE_ENV="production"
EOF
fi

info "2. Instalando dependências do projeto principal..."
npm install

info "3. Instalando dependências do MCP server..."
cd mcp-server && npm install && cd ..

info "4. Fazendo build da aplicação..."
npm run build

info "5. Configurando Nginx..."
sudo cp deploy/nginx-config /etc/nginx/sites-available/moobeChat
sudo ln -sf /etc/nginx/sites-available/moobeChat /etc/nginx/sites-enabled/

# Remover configuração padrão do Nginx
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
if sudo nginx -t; then
    log "Configuração do Nginx válida"
    sudo systemctl reload nginx
else
    error "Erro na configuração do Nginx!"
    exit 1
fi

info "6. Configurando PM2..."
cp deploy/ecosystem.config.js .

info "7. Parando processos anteriores (se existirem)..."
pm2 delete all 2>/dev/null || true

info "8. Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js
pm2 save

# Configurar PM2 para iniciar automaticamente
pm2 startup | grep -E '^sudo' | bash || true

info "9. Verificando status dos serviços..."
echo ""
log "Status do PM2:"
pm2 status

echo ""
log "Status do Nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
log "Testando aplicação localmente..."
sleep 3
if curl -s http://localhost:3000 > /dev/null; then
    log "✅ Aplicação respondendo na porta 3000"
else
    warn "⚠️  Aplicação pode não estar respondendo na porta 3000"
fi

echo ""
echo "🎉 Deploy concluído!"
echo ""
info "URLs de acesso:"
echo "🌐 Aplicação: http://$IP"
echo "🔧 Logs: pm2 logs"
echo "📊 Status: pm2 status"
echo ""
info "Comandos úteis:"
echo "• Restart: pm2 restart all"
echo "• Logs em tempo real: pm2 logs --lines 50"
echo "• Status do Nginx: sudo systemctl status nginx"
echo "• Logs do Nginx: sudo tail -f /var/log/nginx/moobeChat_error.log"
echo ""