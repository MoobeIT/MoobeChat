# 🚀 Deploy MoobeChat via Git - Guia Completo

## 📋 Estratégia de Deploy

### **Vantagens do Deploy via Git:**
- ✅ Versionamento completo
- ✅ Rollback fácil
- ✅ Atualizações simples com `git pull`
- ✅ Histórico de mudanças
- ✅ Deploy automatizado

## 🔧 Configuração Inicial

### **1. Preparar Repositório**

#### No seu computador local:
```bash
# Verificar status do Git
git status

# Adicionar arquivos (se necessário)
git add .
git commit -m "Preparar para deploy via Git"

# Push para repositório remoto
git push origin main
```

### **2. Configurar Servidor (Ubuntu AWS)**

#### Conectar na instância:
```bash
ssh -i sua-chave.pem ubuntu@44.235.125.150
```

#### Setup inicial do servidor:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Git
sudo apt install git -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y

# Criar diretório do projeto
sudo mkdir -p /var/www/moobeChat
sudo chown ubuntu:ubuntu /var/www/moobeChat

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## 🎯 Deploy via Git

### **3. Clonar Repositório**

```bash
# Navegar para diretório
cd /var/www

# Clonar repositório (substitua pela sua URL)
git clone https://github.com/SEU-USUARIO/MoobeChat.git moobeChat

# Entrar no diretório
cd moobeChat

# Verificar branch
git branch
```

### **4. Configurar Ambiente de Produção**

```bash
# Criar arquivo de ambiente
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://hnqkqjqjqjqjqjqjqjqj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# NextAuth.js
NEXTAUTH_SECRET="sua-chave-super-secreta-para-producao-$(date +%s)"
NEXTAUTH_URL="http://44.235.125.150"

# UazAPI
UAZAPI_URL="https://free.uazapi.com"
UAZAPI_TOKEN="B7teYpdEf9I9LM9IxDE5CUqmxF68P2LrwtF6NZ5eZu2oqqXz3r"
WEBHOOK_URL="http://44.235.125.150"

# Configurações
MOCK_DATA_ENABLED="false"
NODE_ENV="production"
EOF
```

### **5. Instalar e Buildar**

```bash
# Instalar dependências principais
npm install

# Instalar dependências do MCP server
cd mcp-server
npm install
cd ..

# Buildar aplicação
npm run build
```

### **6. Configurar Nginx**

```bash
# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/moobeChat << 'EOF'
server {
    listen 80;
    server_name 44.235.125.150;

    # Logs
    access_log /var/log/nginx/moobeChat_access.log;
    error_log /var/log/nginx/moobeChat_error.log;

    # Proxy para aplicação Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
```

### **7. Configurar PM2**

```bash
# Criar configuração PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'moobeChat',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/moobeChat',
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

# Criar diretórios de log
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 Atualizações Futuras

### **Deploy de Novas Versões:**

```bash
# Conectar no servidor
ssh -i sua-chave.pem ubuntu@44.235.125.150

# Navegar para projeto
cd /var/www/moobeChat

# Parar aplicação
pm2 stop moobeChat

# Atualizar código
git pull origin main

# Instalar novas dependências (se houver)
npm install

# Atualizar MCP server (se necessário)
cd mcp-server && npm install && cd ..

# Rebuildar aplicação
npm run build

# Reiniciar aplicação
pm2 restart moobeChat

# Verificar status
pm2 status
```

### **Script de Atualização Automática:**

```bash
# Criar script de update
cat > update-app.sh << 'EOF'
#!/bin/bash

echo "🔄 Atualizando MoobeChat..."

# Parar aplicação
pm2 stop moobeChat

# Backup da versão atual
git stash

# Atualizar código
git pull origin main

# Instalar dependências
npm install
cd mcp-server && npm install && cd ..

# Rebuildar
npm run build

# Reiniciar
pm2 restart moobeChat

echo "✅ Atualização concluída!"
pm2 status
EOF

chmod +x update-app.sh
```

## 📊 Monitoramento

### **Comandos Úteis:**

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs moobeChat

# Logs do Nginx
sudo tail -f /var/log/nginx/moobeChat_error.log

# Status do Git
git status
git log --oneline -5

# Verificar aplicação
curl http://localhost:3000
```

## 🔒 Segurança

### **Configurações Importantes:**

1. **Nunca commitar arquivos sensíveis:**
   - `.env.local` está no `.gitignore` ✅
   - Chaves SSH não são commitadas ✅

2. **Usar variáveis de ambiente:**
   - Configurar `.env.local` no servidor
   - Não hardcodar credenciais

3. **Backup regular:**
   ```bash
   # Backup do banco (se necessário)
   # Backup dos arquivos de configuração
   cp .env.local .env.local.backup
   ```

## 🎯 URLs Finais

- **Aplicação:** http://44.235.125.150
- **Webhook:** http://44.235.125.150 (para UazAPI)

## 🆘 Troubleshooting

### **Problemas Comuns:**

```bash
# Aplicação não inicia
pm2 logs moobeChat

# Nginx não funciona
sudo nginx -t
sudo systemctl status nginx

# Git pull falha
git stash
git pull origin main

# Permissões
sudo chown -R ubuntu:ubuntu /var/www/moobeChat
```

---

**🎉 Deploy via Git configurado com sucesso!**