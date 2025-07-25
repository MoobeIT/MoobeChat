#!/bin/bash

# Script para configurar variáveis de ambiente para AWS
# Execute este script ANTES de fazer o deploy

echo "🔧 Configurando variáveis de ambiente para AWS..."

# Solicitar IP elástico
read -p "Digite o IP elástico da sua instância EC2: " IP_ELASTICO

if [ -z "$IP_ELASTICO" ]; then
    echo "❌ IP elástico é obrigatório!"
    exit 1
fi

# Perguntar se tem domínio
read -p "Você tem um domínio configurado? (y/n): " HAS_DOMAIN

if [ "$HAS_DOMAIN" = "y" ] || [ "$HAS_DOMAIN" = "Y" ]; then
    read -p "Digite seu domínio (ex: meusite.com): " DOMAIN
    BASE_URL="https://$DOMAIN"
    echo "✅ Usando domínio: $BASE_URL"
else
    BASE_URL="http://$IP_ELASTICO"
    echo "✅ Usando IP: $BASE_URL"
fi

# Criar arquivo .env.local para produção
cat > .env.local << EOF
# Configuração para Produção AWS - MoobeChat
# Gerado automaticamente em $(date)

# Database - Supabase
DATABASE_URL="postgresql://postgres:LYBXKKXOZA9ewAHk@db.gnnazztjaeukllmnnxyj.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:LYBXKKXOZA9ewAHk@db.gnnazztjaeukllmnnxyj.supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://gnnazztjaeukllmnnxyj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubmF6enRqYWV1a2xsbW5ueHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODY4OTMsImV4cCI6MjA2Njk2Mjg5M30.XIS2x3K4rMiLaWQ8Nlrd-Aw8k_RHGkZjFdGTEpFrsyw"

# NextAuth.js - Produção
NEXTAUTH_SECRET="moobi-chat-production-secret-2024-$(openssl rand -hex 16)"
NEXTAUTH_URL="$BASE_URL"

# UazAPI - WhatsApp
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="B7teYpdEf9I9LM9IxDE5CUqmxF68P2LrwtF6NZ5eZu2oqqXz3r"

# Webhook URL
WEBHOOK_URL="$BASE_URL"

# Production settings
MOCK_DATA_ENABLED="false"
NODE_ENV="production"
EOF

echo ""
echo "✅ Arquivo .env.local configurado para produção!"
echo "📍 Base URL: $BASE_URL"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique o arquivo .env.local gerado"
echo "2. Faça o upload do projeto para a AWS"
echo "3. Execute o deploy"
echo ""