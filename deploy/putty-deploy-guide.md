# Guia de Conexão PuTTY e Deploy AWS

## 🔑 Conectando via PuTTY

### 1. Configuração do PuTTY

**Dados da sua instância:**
- **IP:** 44.235.125.150
- **Usuário:** ubuntu (padrão para Ubuntu)
- **Porta:** 22

### 2. Passos no PuTTY

1. **Abra o PuTTY**
2. **Session:**
   - Host Name: `ubuntu@44.235.125.150`
   - Port: `22`
   - Connection type: `SSH`

3. **SSH > Auth > Credentials:**
   - Private key file: Selecione seu arquivo `.ppk` (chave privada)
   - Se você tem arquivo `.pem`, converta para `.ppk` usando PuTTYgen

4. **Clique em "Open"**

### 3. Convertendo .pem para .ppk (se necessário)

1. Abra **PuTTYgen**
2. **Load** → Selecione seu arquivo `.pem`
3. **Save private key** → Salve como `.ppk`
4. Use o arquivo `.ppk` no PuTTY

## 📁 Upload dos Arquivos

### Opção 1: WinSCP (Recomendado)
1. **Baixe o WinSCP**
2. **Configure:**
   - Host: `44.235.125.150`
   - Username: `ubuntu`
   - Private key: Seu arquivo `.ppk`
3. **Conecte e faça upload da pasta completa**

### Opção 2: Via PuTTY/SCP
```bash
# No Windows (PowerShell)
scp -i sua-chave.pem -r . ubuntu@44.235.125.150:/home/ubuntu/moobeChat/
```

## 🚀 Comandos para Deploy (Execute no PuTTY)

### 1. Primeiro acesso - Configuração inicial
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Instalar Git
sudo apt install git -y
```

### 2. Preparar diretório do projeto
```bash
# Criar diretório
sudo mkdir -p /var/www/moobeChat
sudo chown ubuntu:ubuntu /var/www/moobeChat

# Se fez upload para /home/ubuntu, mover arquivos
mv /home/ubuntu/moobeChat/* /var/www/moobeChat/
# OU se fez upload direto
cd /var/www/moobeChat
```

### 3. Configurar projeto
```bash
cd /var/www/moobeChat

# Copiar configuração de produção
cp .env.aws .env.local

# Instalar dependências
npm install

# Instalar dependências do MCP
cd mcp-server && npm install && cd ..

# Build do projeto
npm run build
```

### 4. Configurar Nginx
```bash
# Copiar configuração
sudo cp deploy/nginx-config /etc/nginx/sites-available/moobeChat

# Editar para ajustar o domínio/IP
sudo nano /etc/nginx/sites-available/moobeChat
# Substitua "SEU-DOMINIO.com" por "44.235.125.150" ou seu domínio

# Ativar configuração
sudo ln -s /etc/nginx/sites-available/moobeChat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Iniciar aplicação
```bash
# Copiar configuração PM2
cp deploy/ecosystem.config.js .

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## 🔍 Verificação

### Testar aplicação
```bash
# Verificar se está rodando
pm2 status

# Testar localmente
curl http://localhost:3000

# Ver logs
pm2 logs
```

### Testar no navegador
Acesse: `http://44.235.125.150`

## 🛠️ Comandos Úteis

```bash
# Restart da aplicação
pm2 restart all

# Ver logs em tempo real
pm2 logs --lines 50

# Status do Nginx
sudo systemctl status nginx

# Restart do Nginx
sudo systemctl restart nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

## ⚠️ Troubleshooting

### Se a aplicação não iniciar:
```bash
# Verificar logs
pm2 logs moobeChat

# Verificar se a porta está livre
sudo netstat -tlnp | grep :3000

# Verificar variáveis de ambiente
cat .env.local
```

### Se o Nginx não funcionar:
```bash
# Testar configuração
sudo nginx -t

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```