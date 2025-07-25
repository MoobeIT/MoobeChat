#!/bin/bash

# Script de Deploy Rápido para Ubuntu AWS
# Execute este script na sua instância Ubuntu

echo "🚀 Iniciando deploy do MoobeChat na instância Ubuntu AWS..."
echo "IP: 44.235.125.150"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se está no Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    error "Este script é para Ubuntu!"
    exit 1
fi

log "Atualizando sistema Ubuntu..."
sudo apt update && sudo apt upgrade -y

log "Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log "Node.js instalado: $(node --version)"
else
    log "Node.js já instalado: $(node --version)"
fi

log "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log "PM2 instalado: $(pm2 --version)"
else
    log "PM2 já instalado: $(pm2 --version)"
fi

log "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    log "Nginx instalado e iniciado"
else
    log "Nginx já instalado"
fi

log "Instalando utilitários..."
sudo apt install git curl unzip -y

log "Criando diretório do projeto..."
sudo mkdir -p /var/www/moobeChat
sudo chown $USER:$USER /var/www/moobeChat

log "Criando diretórios de log..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

log "Configurando firewall Ubuntu..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo ""
warn "PRÓXIMOS PASSOS:"
echo "1. Faça upload dos arquivos do projeto para: /var/www/moobeChat"
echo "2. Execute: cd /var/www/moobeChat && ./deploy/ubuntu-deploy.sh"
echo ""

log "Configuração inicial do Ubuntu concluída! ✅"