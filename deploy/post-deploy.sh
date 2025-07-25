#!/bin/bash

# Script para comandos pós-deploy
# Execute após fazer upload dos arquivos e configurar .env.local

set -e

PROJECT_DIR="/var/www/moobeChat"
NGINX_CONFIG="/etc/nginx/sites-available/moobeChat"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log "Navegando para o diretório do projeto..."
cd $PROJECT_DIR

log "Instalando dependências..."
npm install

log "Instalando dependências do MCP server..."
cd mcp-server && npm install && cd ..

log "Fazendo build da aplicação..."
npm run build

log "Copiando configuração do Nginx..."
sudo cp deploy/nginx-config $NGINX_CONFIG

warn "EDITE o arquivo de configuração do Nginx:"
echo "sudo nano $NGINX_CONFIG"
echo "Substitua 'SEU-DOMINIO.com' pelo seu domínio real ou IP elástico"
echo ""

log "Ativando configuração do Nginx..."
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t

log "Copiando configuração do PM2..."
cp deploy/ecosystem.config.js .

log "Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

log "Recarregando Nginx..."
sudo systemctl reload nginx

log "Configurando firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo ""
log "Deploy concluído! ✅"
echo ""
warn "PRÓXIMOS PASSOS:"
echo "1. Verifique se a aplicação está rodando: pm2 status"
echo "2. Teste o acesso: curl http://localhost:3000"
echo "3. Configure SSL com Let's Encrypt (se tiver domínio):"
echo "   sudo certbot --nginx -d SEU-DOMINIO.com"
echo "4. Monitore os logs: pm2 logs"
echo ""