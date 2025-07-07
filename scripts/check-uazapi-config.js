const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do UazAPI...\n');

// Verificar se existe .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`📁 Arquivo .env.local: ${envExists ? '✅ Encontrado' : '❌ Não encontrado'}`);

if (!envExists) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('💡 Crie o arquivo .env.local na raiz do projeto com as configurações necessárias.');
  process.exit(1);
}

// Ler variáveis de ambiente
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const config = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    config[key.trim()] = value.trim();
  }
});

console.log('\n🔧 Configurações encontradas:');

// Verificar UAZAPI_URL
const uazApiUrl = config.UAZAPI_URL || process.env.UAZAPI_URL;
console.log(`   UAZAPI_URL: ${uazApiUrl ? '✅ Configurado' : '❌ Não configurado'}`);
if (uazApiUrl) {
  console.log(`   └── URL: ${uazApiUrl}`);
  
  if (uazApiUrl.includes('free.uazapi.com')) {
    console.log('   ⚠️  Servidor de demonstração detectado - funcionalidade limitada');
  }
}

// Verificar UAZAPI_TOKEN
const uazApiToken = config.UAZAPI_TOKEN || process.env.UAZAPI_TOKEN;
console.log(`   UAZAPI_TOKEN: ${uazApiToken ? '✅ Configurado' : '❌ Não configurado'}`);
if (uazApiToken) {
  console.log(`   └── Token: ${uazApiToken.slice(0, 10)}...`);
  
  if (uazApiToken === 'your-uazapi-token-here') {
    console.log('   ❌ Token padrão detectado - configure um token válido');
  }
}

// Verificar WEBHOOK_URL
const webhookUrl = config.WEBHOOK_URL || process.env.WEBHOOK_URL;
console.log(`   WEBHOOK_URL: ${webhookUrl ? '✅ Configurado' : '❌ Não configurado'}`);
if (webhookUrl) {
  console.log(`   └── URL: ${webhookUrl}`);
  console.log(`   └── Webhook será: ${webhookUrl}/api/webhooks/uazapi`);
}

// Verificar DATABASE_URL
const databaseUrl = config.DATABASE_URL || process.env.DATABASE_URL;
console.log(`   DATABASE_URL: ${databaseUrl ? '✅ Configurado' : '❌ Não configurado'}`);

// Verificar NEXTAUTH_SECRET
const nextAuthSecret = config.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET;
console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret ? '✅ Configurado' : '❌ Não configurado'}`);

console.log('\n📋 Resumo da configuração:');

const requiredConfigs = [
  { name: 'UAZAPI_URL', value: uazApiUrl },
  { name: 'UAZAPI_TOKEN', value: uazApiToken },
  { name: 'WEBHOOK_URL', value: webhookUrl },
  { name: 'DATABASE_URL', value: databaseUrl },
  { name: 'NEXTAUTH_SECRET', value: nextAuthSecret }
];

let missingConfigs = [];
let validConfigs = 0;

requiredConfigs.forEach(({ name, value }) => {
  if (!value || value === 'your-uazapi-token-here') {
    missingConfigs.push(name);
  } else {
    validConfigs++;
  }
});

console.log(`   ✅ Configurações válidas: ${validConfigs}/${requiredConfigs.length}`);
console.log(`   ❌ Configurações ausentes: ${missingConfigs.length}`);

if (missingConfigs.length > 0) {
  console.log('\n❌ Configurações ausentes ou inválidas:');
  missingConfigs.forEach(config => {
    console.log(`   • ${config}`);
  });
  
  console.log('\n💡 Exemplo de configuração:');
  console.log('```env');
  console.log('UAZAPI_URL=https://api.meuwhatsapp.com');
  console.log('UAZAPI_TOKEN=B7teYpdEf9I9LM9IxDE5CUqmxF68P2LrwtF6NZ5eZu2oqqXz3r');
  console.log('WEBHOOK_URL=https://meuapp.com');
  console.log('DATABASE_URL=postgresql://...');
  console.log('NEXTAUTH_SECRET=seu-secret-aqui');
  console.log('```');
} else {
  console.log('\n✅ Configuração válida!');
  console.log('💡 Use os botões "Testar UazAPI" e "Sincronizar UazAPI" na interface para verificar a conectividade.');
}

console.log('\n🔗 Para mais informações, consulte: CONFIGURACAO-UAZAPI.md'); 