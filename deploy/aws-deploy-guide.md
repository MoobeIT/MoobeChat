# Guia de Deploy AWS - MoobeChat

## Pré-requisitos
- Instância EC2 criada e rodando
- IP elástico configurado
- Acesso SSH configurado
- Domínio (opcional, mas recomendado)

## 1. Preparação da Instância EC2

### Conectar via SSH
```bash
ssh -i sua-chave.pem ubuntu@SEU-IP-ELASTICO
```

### Atualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar Node.js (versão 18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Instalar PM2 (gerenciador de processos)
```bash
sudo npm install -g pm2
```

### Instalar Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Instalar Git
```bash
sudo apt install git -y
```

## 2. Configuração do Projeto

### Clonar o repositório (ou fazer upload)
```bash
cd /var/www
sudo mkdir moobeChat
sudo chown $USER:$USER moobeChat
cd moobeChat

# Se usando Git
git clone SEU-REPOSITORIO .

# Ou fazer upload via SCP/SFTP dos arquivos
```

### Instalar dependências
```bash
npm install
```

### Configurar variáveis de ambiente
```bash
cp env.example .env.local
nano .env.local
```

### Build do projeto
```bash
npm run build
```

## 3. Configuração do PM2

### Criar arquivo de configuração do PM2
```bash
nano ecosystem.config.js
```

### Iniciar aplicação com PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Configuração do Nginx

### Configurar proxy reverso
```bash
sudo nano /etc/nginx/sites-available/moobeChat
```

### Ativar configuração
```bash
sudo ln -s /etc/nginx/sites-available/moobeChat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Configuração SSL (Opcional mas Recomendado)

### Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obter certificado SSL
```bash
sudo certbot --nginx -d SEU-DOMINIO.com
```

## 6. Configuração de Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 7. Monitoramento

### Ver logs da aplicação
```bash
pm2 logs
```

### Status dos processos
```bash
pm2 status
```

### Restart da aplicação
```bash
pm2 restart all
```

## Variáveis de Ambiente para Produção

Certifique-se de configurar no `.env.local`:

```env
# URLs de produção
NEXTAUTH_URL="https://SEU-DOMINIO.com"
WEBHOOK_URL="https://SEU-DOMINIO.com"

# Desabilitar dados mock
MOCK_DATA_ENABLED="false"

# Manter suas configurações do Supabase e UazAPI
```

## Troubleshooting

### Verificar se a aplicação está rodando
```bash
curl http://localhost:3000
```

### Verificar logs do Nginx
```bash
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar serviços
```bash
sudo systemctl restart nginx
pm2 restart all
```