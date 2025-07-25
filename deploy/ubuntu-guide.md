# Deploy MoobeChat - Ubuntu AWS

## 🎯 Processo Simplificado

### **Dados da sua instância:**
- **IP:** 44.235.125.150
- **SO:** Ubuntu
- **Usuário:** ubuntu

## 🚀 Passo a Passo

### **1. Conectar via SSH**
```bash
ssh -i sua-chave.pem ubuntu@44.235.125.150
```

### **2. Configuração inicial (primeira vez)**
```bash
# Fazer upload do script de setup
# No seu computador local:
scp -i sua-chave.pem deploy/ubuntu-setup.sh ubuntu@44.235.125.150:~/

# Na instância Ubuntu:
chmod +x ubuntu-setup.sh
./ubuntu-setup.sh
```

### **3. Upload do projeto**
```bash
# No seu computador local:
scp -i sua-chave.pem -r . ubuntu@44.235.125.150:/var/www/moobeChat/
```

### **4. Deploy da aplicação**
```bash
# Na instância Ubuntu:
cd /var/www/moobeChat
chmod +x deploy/ubuntu-deploy.sh
./deploy/ubuntu-deploy.sh
```

## ✅ Verificação

### **Testar aplicação:**
- Acesse: **http://44.235.125.150**

### **Comandos úteis:**
```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs

# Restart da aplicação
pm2 restart all

# Status do Nginx
sudo systemctl status nginx

# Logs do Nginx
sudo tail -f /var/log/nginx/moobeChat_error.log
```

## 🔧 Troubleshooting

### **Se a aplicação não iniciar:**
```bash
# Ver logs detalhados
pm2 logs moobeChat

# Verificar se a porta está livre
sudo netstat -tlnp | grep :3000

# Verificar variáveis de ambiente
cat .env.local
```

### **Se o Nginx não funcionar:**
```bash
# Testar configuração
sudo nginx -t

# Restart do Nginx
sudo systemctl restart nginx

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

### **Problemas de permissão:**
```bash
# Corrigir permissões
sudo chown -R ubuntu:ubuntu /var/www/moobeChat
```

## 📋 Resumo dos Arquivos

- `ubuntu-setup.sh` - Configuração inicial do Ubuntu
- `ubuntu-deploy.sh` - Deploy da aplicação
- `.env.aws` - Variáveis de ambiente configuradas
- `nginx-config` - Configuração do Nginx
- `ecosystem.config.js` - Configuração do PM2

## 🌐 URLs Finais

Após o deploy:
- **Aplicação:** http://44.235.125.150
- **Webhook URL:** http://44.235.125.150 (para UazAPI)