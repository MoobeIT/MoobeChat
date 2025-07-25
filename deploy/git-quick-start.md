# 🚀 Deploy via Git - Instruções Rápidas

## ⚡ Processo Simplificado

### **1. Preparar Repositório (Uma vez)**
```bash
# No seu computador
git add .
git commit -m "Preparar para deploy via Git"
git push origin main
```

### **2. Deploy Inicial (Primeira vez)**
```bash
# Conectar no servidor
ssh -i sua-chave.pem ubuntu@44.235.125.150

# Fazer upload do script
scp -i sua-chave.pem deploy/git-auto-deploy.sh ubuntu@44.235.125.150:~/

# Executar deploy automático
chmod +x git-auto-deploy.sh
./git-auto-deploy.sh
```

### **3. Configurar Credenciais**
```bash
# No servidor, editar .env.local
cd /var/www/moobeChat
nano .env.local

# Configurar suas credenciais do Supabase
# Salvar e reiniciar
pm2 restart moobeChat
```

### **4. Atualizações Futuras**
```bash
# No seu computador - fazer mudanças e push
git add .
git commit -m "Nova funcionalidade"
git push origin main

# No servidor - atualizar
cd /var/www/moobeChat
./deploy/git-update.sh
```

## 🎯 URLs
- **App:** http://44.235.125.150
- **Logs:** `pm2 logs moobeChat`

## 📝 Arquivos Criados
- `git-deploy-guide.md` - Guia completo
- `git-auto-deploy.sh` - Deploy inicial automático
- `git-update.sh` - Atualizações rápidas