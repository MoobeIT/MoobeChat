const fetch = require('node-fetch');
require('dotenv').config();

// Simular uma sessão de usuário para a API
const { getServerSession } = require('next-auth');
const { authOptions } = require('../src/lib/auth');

async function deletePlatformViaAPI() {
  try {
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🗑️ Removendo plataforma via API da aplicação...');
    console.log(`ID: ${platformId}`);
    
    // Fazer a requisição DELETE para a API
    const response = await fetch(`http://localhost:3000/api/integrations/${platformId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Simular cookies de sessão (isso não funcionará sem uma sessão real)
        'Cookie': 'next-auth.session-token=fake-token'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Plataforma removida com sucesso via API!');
      console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    } else {
      console.error('❌ Erro ao remover plataforma via API:', data.error || 'Erro desconhecido');
      console.log('Status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Como alternativa, vamos tentar usar a API do WhatsApp instances
async function deletePlatformViaWhatsAppAPI() {
  try {
    const platformId = 'cmd6nujkh0001m9mwocvky970';
    
    console.log('🗑️ Removendo plataforma via API WhatsApp instances...');
    console.log(`ID: ${platformId}`);
    
    // Fazer a requisição DELETE para a API do WhatsApp
    const response = await fetch(`http://localhost:3000/api/whatsapp/instances?platformId=${platformId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Simular cookies de sessão (isso não funcionará sem uma sessão real)
        'Cookie': 'next-auth.session-token=fake-token'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Plataforma removida com sucesso via API WhatsApp!');
      console.log('🎉 Agora você pode tentar adicionar a plataforma novamente.');
    } else {
      console.error('❌ Erro ao remover plataforma via API WhatsApp:', data.error || 'Erro desconhecido');
      console.log('Status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

console.log('🚀 Tentando remover plataforma via APIs da aplicação...');
console.log('⚠️ Nota: Essas tentativas podem falhar devido à autenticação.');
console.log('');

// Tentar ambas as APIs
deletePlatformViaAPI().then(() => {
  console.log('');
  return deletePlatformViaWhatsAppAPI();
});