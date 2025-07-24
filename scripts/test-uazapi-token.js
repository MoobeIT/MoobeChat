const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const UAZAPI_URL = process.env.UAZAPI_URL || 'https://free.uazapi.com';
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN;

async function testUazApiToken() {
  console.log('🧪 Testando token UazAPI...');
  console.log(`🔗 URL: ${UAZAPI_URL}`);
  console.log(`🔑 Token: ${UAZAPI_TOKEN ? `${UAZAPI_TOKEN.slice(0, 10)}...` : 'NÃO CONFIGURADO'}`);
  
  if (!UAZAPI_TOKEN) {
    console.error('❌ Token UazAPI não configurado!');
    return;
  }
  
  try {
    // Teste 1: Verificar se o token é válido tentando listar instâncias
    console.log('\n📋 Teste 1: Tentando listar instâncias existentes...');
    try {
      const listResponse = await axios.get(`${UAZAPI_URL}/instance/all`, {
        headers: {
          'admintoken': UAZAPI_TOKEN,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Token válido! Instâncias encontradas:');
      console.log(JSON.stringify(listResponse.data, null, 2));
    } catch (listError) {
      if (listError.response?.status === 404) {
        console.log('⚠️ Endpoint /instance/all não disponível (normal no servidor gratuito)');
        console.log('✅ Token parece válido (erro 404 indica endpoint desabilitado, não token inválido)');
      } else if (listError.response?.status === 401 && listError.response?.data?.error?.includes('public demo server')) {
        console.log('⚠️ Servidor demo público - endpoint /instance/all desabilitado');
        console.log('✅ Isso é normal no servidor gratuito da UazAPI');
      } else {
        throw listError; // Re-throw outros erros
      }
    }
    
    // Teste 2: Tentar criar uma instância de teste (teste principal)
    console.log('\n🚀 Teste 2: Criando instância de teste...');
    const testInstanceName = `test_${Date.now()}`;
    
    const createResponse = await axios.post(`${UAZAPI_URL}/instance/init`, {
      name: testInstanceName
    }, {
      headers: {
        'admintoken': UAZAPI_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Instância de teste criada:');
    console.log(JSON.stringify(createResponse.data, null, 2));
    
    // Teste 3: Verificar status da instância criada
    if (createResponse.data.token) {
      console.log('\n🔍 Teste 3: Verificando status da instância...');
      
      // Aguardar um pouco para a instância ser criada
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await axios.get(`${UAZAPI_URL}/instance/status`, {
        headers: {
          'token': createResponse.data.token,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Status da instância:');
      console.log(JSON.stringify(statusResponse.data, null, 2));
      
      // Teste 4: Deletar instância de teste
      console.log('\n🗑️ Teste 4: Removendo instância de teste...');
      try {
        const deleteResponse = await axios.delete(`${UAZAPI_URL}/instance/delete`, {
          headers: {
            'token': createResponse.data.token,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log('✅ Instância de teste removida:');
        console.log(JSON.stringify(deleteResponse.data, null, 2));
      } catch (deleteError) {
        console.warn('⚠️ Erro ao remover instância de teste (normal se não suportado):', deleteError.response?.data || deleteError.message);
      }
    }
    
    console.log('\n🎉 Todos os testes passaram! Token UazAPI está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro nos testes UazAPI:');
    
    if (error.response) {
      console.error('📋 Detalhes do erro:');
      console.error('  - Status:', error.response.status);
      console.error('  - Data:', JSON.stringify(error.response.data, null, 2));
      console.error('  - Headers:', error.response.headers);
      
      if (error.response.status === 401) {
        console.error('\n🚫 ERRO 401: Token inválido ou expirado!');
        console.error('   - Verifique se o token UAZAPI_TOKEN está correto no .env.local');
        console.error('   - Verifique se o token não expirou');
        console.error('   - Tente gerar um novo token no painel UazAPI');
      } else if (error.response.status === 403) {
        console.error('\n🚫 ERRO 403: Acesso negado!');
        console.error('   - Verifique se sua conta UazAPI tem permissões suficientes');
        console.error('   - Verifique se não excedeu o limite de instâncias');
      } else if (error.response.status === 429) {
        console.error('\n🚫 ERRO 429: Muitas requisições!');
        console.error('   - Aguarde alguns minutos antes de tentar novamente');
        console.error('   - Verifique se não está fazendo muitas chamadas à API');
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('\n🌐 ERRO DE CONEXÃO:');
      console.error('   - Verifique sua conexão com a internet');
      console.error('   - Verifique se a URL da UazAPI está correta:', UAZAPI_URL);
    } else {
      console.error('\n❓ Erro desconhecido:');
      console.error('   - Mensagem:', error.message);
      console.error('   - Código:', error.code);
    }
  }
}

testUazApiToken().catch(console.error);