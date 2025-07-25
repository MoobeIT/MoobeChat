#!/bin/bash

# Script de Deploy Automatizado para AWS EC2
# Execute este script na sua instância EC2

set -e

echo "🚀 Iniciando deploy do MoobeChat..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    error "Não execute este script como root!"
    exit 1
fi

# Variáveis
PROJECT_DIR="/var/www/moobeChat"
NGINX_CONFIG="/etc/nginx/sites-available/moobeChat"

log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

log "Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log "Node.js já está instalado: $(node --version)"
fi

log "Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    log "PM2 já está instalado: $(pm2 --version)"
fi

log "Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    log "Nginx já está instalado"
fi

log "Instalando Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
else
    log "Git já está instalado"
fi

log "Criando diretório do projeto..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

log "Configurando diretórios de log do PM2..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

echo ""
warn "PRÓXIMOS PASSOS MANUAIS:"
echo "1. Faça upload dos arquivos do projeto para: $PROJECT_DIR"
echo "2. Configure o arquivo .env.local com suas variáveis de produção"
echo "3. Execute os comandos de instalação e build:"
echo "   cd $PROJECT_DIR"
echo "   npm install"
echo "   npm run build"
echo "4. Configure o Nginx com o arquivo de configuração fornecido"
echo "5. Inicie a aplicação com PM2"
echo ""

log "Configuração básica concluída! ✅"