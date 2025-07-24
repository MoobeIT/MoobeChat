// Script de debug para testar conexão de instância UazAPI
// Execute este script no console do navegador na página de integrações

async function debugConnectInstance() {
  console.log('🔍 INICIANDO DEBUG DE CONEXÃO DE INSTÂNCIA');
  
  // 1. Verificar se há instâncias no estado
  const instancesElement = document.querySelector('[data-testid="instances-list"]');
  if (!instancesElement) {
    console.log('❌ Elemento de lista de instâncias não encontrado');
    return;
  }
  
  // 2. Buscar instâncias do banco de dados
  try {
    console.log('📋 Buscando instâncias do banco...');
    const response = await fetch('/api/whatsapp/instances');
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${data.instances.length} instâncias encontradas:`);
      data.instances.forEach((instance, index) => {
        console.log(`  ${index + 1}. ${instance.name} - Status: ${instance.status}`);
        console.log(`     Token: ${instance.config?.instanceToken?.slice(0, 10)}...`);
        console.log(`     Criada em: ${instance.createdAt}`);
      });
      
      // 3. Testar conexão da primeira instância desconectada
      const disconnectedInstance = data.instances.find(i => i.status === 'disconnected' || i.status === 'initialized');
      
      if (disconnectedInstance) {
        console.log(`\n🔗 Testando conexão da instância: ${disconnectedInstance.name}`);
        await testInstanceConnection(disconnectedInstance.id);
      } else {
        console.log('\n⚠️ Nenhuma instância desconectada encontrada para testar');
      }
    } else {
      console.error('❌ Erro ao buscar instâncias:', data.error);
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

async function testInstanceConnection(platformId) {
  try {
    console.log(`\n🚀 Iniciando teste de conexão para plataforma ${platformId}`);
    
    const response = await fetch('/api/integrations/whatsapp/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ platformId })
    });
    
    const data = await response.json();
    
    console.log('📊 Resposta da API de conexão:');
    console.log('  Status HTTP:', response.status);
    console.log('  Success:', data.success);
    
    if (data.success) {
      console.log('✅ CONEXÃO BEM-SUCEDIDA!');
      console.log('  QR Code presente:', !!data.qrcode);
      console.log('  Status:', data.status);
      console.log('  Instance Token:', data.instanceToken?.slice(0, 10) + '...');
      console.log('  Instance Name:', data.instanceName);
      
      if (data.qrcode) {
        console.log('🎯 QR CODE OBTIDO COM SUCESSO!');
        console.log('  Tamanho do QR Code:', data.qrcode.length, 'caracteres');
        console.log('  Tipo:', data.qrcode.startsWith('data:image') ? 'Base64 Image' : 'Texto/URL');
        
        // Tentar exibir o QR Code se for uma imagem base64
        if (data.qrcode.startsWith('data:image')) {
          const img = document.createElement('img');
          img.src = data.qrcode;
          img.style.maxWidth = '200px';
          img.style.border = '2px solid green';
          img.title = 'QR Code de Debug';
          document.body.appendChild(img);
          console.log('🖼️ QR Code adicionado à página para visualização');
        }
      } else {
        console.log('❌ QR CODE NÃO RETORNADO!');
        console.log('  Isso pode indicar um problema na API UazAPI');
      }
    } else {
      console.log('❌ FALHA NA CONEXÃO:');
      console.log('  Erro:', data.error);
      console.log('  Detalhes:', data.details);
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste de conexão:', error);
  }
}

// Função para testar diretamente a UazAPI
async function testUazApiDirect() {
  console.log('\n🔧 TESTE DIRETO DA UAZAPI');
  
  const token = prompt('Cole o token da instância para testar:');
  if (!token) {
    console.log('❌ Token não fornecido');
    return;
  }
  
  try {
    // Testar status primeiro
    console.log('1. Testando status da instância...');
    const statusResponse = await fetch('/api/test-uazapi-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'status',
        token: token 
      })
    });
    
    const statusData = await statusResponse.json();
    console.log('📊 Status:', statusData);
    
    // Testar conexão
    console.log('2. Testando conexão...');
    const connectResponse = await fetch('/api/test-uazapi-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'connect',
        token: token 
      })
    });
    
    const connectData = await connectResponse.json();
    console.log('🔗 Conexão:', connectData);
    
    if (connectData.success && connectData.qrcode) {
      console.log('✅ QR Code obtido diretamente da UazAPI!');
      
      // Exibir QR Code
      const img = document.createElement('img');
      img.src = connectData.qrcode;
      img.style.maxWidth = '200px';
      img.style.border = '2px solid blue';
      img.title = 'QR Code Direto UazAPI';
      document.body.appendChild(img);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste direto:', error);
  }
}

// Executar debug
console.log('🚀 Executando debug de conexão de instância...');
debugConnectInstance();

// Disponibilizar funções globalmente para uso manual
window.debugConnectInstance = debugConnectInstance;
window.testUazApiDirect = testUazApiDirect;

console.log('\n💡 Funções disponíveis:');
console.log('  - debugConnectInstance() - Debug completo');
console.log('  - testUazApiDirect() - Teste direto com token');