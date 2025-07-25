# Deploy MoobeChat para AWS EC2

Este diretório contém todos os arquivos necessários para fazer o deploy do MoobeChat em uma instância EC2 da AWS.

## Arquivos Incluídos

- `aws-deploy-guide.md` - Guia completo passo a passo
- `deploy-setup.sh` - Script para configuração inicial da instância
- `post-deploy.sh` - Script para executar após upload dos arquivos
- `ecosystem.config.js` - Configuração do PM2
- `nginx-config` - Configuração do Nginx
- `.env.production` - Template de variáveis de ambiente para produção

## Processo de Deploy

### 1. Preparação Local
```bash
# Tornar scripts executáveis
chmod +x deploy/deploy-setup.sh
chmod +x deploy/post-deploy.sh
```

### 2. Configuração da Instância EC2
```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@SEU-IP-ELASTICO

# Fazer upload do script de setup
scp -i sua-chave.pem deploy/deploy-setup.sh ubuntu@SEU-IP-ELASTICO:~/

# Executar setup inicial
./deploy-setup.sh
```

### 3. Upload dos Arquivos
```bash
# Fazer upload de todo o projeto
scp -i sua-chave.pem -r . ubuntu@SEU-IP-ELASTICO:/var/www/moobeChat/
```

### 4. Configuração Final
```bash
# Na instância EC2
cd /var/www/moobeChat

# Configurar variáveis de ambiente
cp deploy/.env.production .env.local
nano .env.local  # Editar com suas configurações

# Executar script pós-deploy
./deploy/post-deploy.sh
```

### 5. Configurar SSL (Opcional)
```bash
# Se tiver domínio
sudo certbot --nginx -d SEU-DOMINIO.com
```

## Monitoramento

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs

# Restart da aplicação
pm2 restart all

# Logs do Nginx
sudo tail -f /var/log/nginx/moobeChat_error.log
```

## Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs moobeChat

# Verificar se a porta está livre
sudo netstat -tlnp | grep :3000
```

### Nginx não funciona
```bash
# Testar configuração
sudo nginx -t

# Verificar status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx
```

### Problemas de permissão
```bash
# Corrigir permissões
sudo chown -R $USER:$USER /var/www/moobeChat
```