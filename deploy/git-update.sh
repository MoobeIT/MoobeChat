#!/bin/bash

# 🔄 Script de Atualização Rápida via Git
# Para atualizações futuras do MoobeChat

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

PROJECT_DIR="/var/www/moobeChat"

echo "🔄 Atualização Rápida MoobeChat"
echo "==============================="

# Verificar se estamos no diretório correto
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Projeto não encontrado em $PROJECT_DIR"
    echo "Execute primeiro o git-auto-deploy.sh"
    exit 1
fi

cd $PROJECT_DIR

# 1. Backup da configuração
if [ -f ".env.local" ]; then
    log "💾 Fazendo backup da configuração..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# 2. Parar aplicação
log "⏹️  Parando aplicação..."
pm2 stop moobeChat || true

# 3. Atualizar código
log "📥 Atualizando código do Git..."
git stash push -m "Auto-stash before update $(date)"
git pull origin main

# 4. Instalar dependências (se package.json mudou)
if git diff HEAD~1 --name-only | grep -q "package.json"; then
    log "📦 Atualizando dependências..."
    npm install
    
    if [ -d "mcp-server" ] && git diff HEAD~1 --name-only | grep -q "mcp-server/package.json"; then
        log "📦 Atualizando dependências do MCP server..."
        cd mcp-server
        npm install
        cd ..
    fi
fi

# 5. Rebuildar aplicação
log "🔨 Rebuildando aplicação..."
npm run build

# 6. Reiniciar aplicação
log "🚀 Reiniciando aplicação..."
pm2 restart moobeChat

# 7. Verificar status
log "🔍 Verificando status..."
sleep 3

if pm2 list | grep -q "online"; then
    log "✅ Aplicação reiniciada com sucesso!"
else
    warn "⚠️  Possível problema na aplicação"
    echo "Verifique os logs: pm2 logs moobeChat"
fi

echo ""
info "🎉 Atualização concluída!"
info "📊 Status: pm2 status"
info "🔧 Logs: pm2 logs moobeChat"