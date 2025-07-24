// Script simples para testar se a migração está funcionando
// Testa fazendo uma requisição HTTP para a aplicação

const http = require('http')

function testApplicationHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        })
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.end()
  })
}

async function testSupabaseMigration() {
  console.log('🧪 Testando migração do Prisma para Supabase...')
  console.log('\n📋 Verificações realizadas:')
  
  try {
    // Teste 1: Verificar se a aplicação está rodando
    console.log('\n1. 🔍 Verificando se a aplicação está rodando...')
    const response = await testApplicationHealth()
    
    if (response.statusCode === 200) {
      console.log('   ✅ Aplicação está rodando em http://localhost:3000')
    } else {
      console.log(`   ⚠️  Aplicação respondeu com status ${response.statusCode}`)
    }
    
    // Teste 2: Verificar se não há erros de Prisma na página
    console.log('\n2. 🔍 Verificando se há erros de Prisma na resposta...')
    const hasError = response.data.toLowerCase().includes('prisma') && 
                    (response.data.toLowerCase().includes('error') || 
                     response.data.toLowerCase().includes('cannot connect'))
    
    if (!hasError) {
      console.log('   ✅ Nenhum erro de Prisma detectado na página')
    } else {
      console.log('   ❌ Possíveis erros de Prisma detectados na página')
    }
    
    // Teste 3: Verificar se a página carregou corretamente
    console.log('\n3. 🔍 Verificando se a página carregou corretamente...')
    const hasContent = response.data.length > 1000 // Página com conteúdo substancial
    
    if (hasContent) {
      console.log('   ✅ Página carregou com conteúdo substancial')
    } else {
      console.log('   ⚠️  Página carregou com pouco conteúdo')
    }
    
    console.log('\n🎉 Teste de migração concluído!')
    console.log('\n📊 Resumo:')
    console.log(`   - Status da aplicação: ${response.statusCode}`)
    console.log(`   - Tamanho da resposta: ${response.data.length} caracteres`)
    console.log(`   - Erros de Prisma detectados: ${hasError ? 'Sim' : 'Não'}`)
    
    if (response.statusCode === 200 && !hasError && hasContent) {
      console.log('\n✅ Migração do Prisma para Supabase parece ter sido bem-sucedida!')
      console.log('\n🔗 Acesse http://localhost:3000 para testar a aplicação')
    } else {
      console.log('\n⚠️  Podem haver problemas na migração. Verifique os logs da aplicação.')
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
    console.error('\n🔧 Possíveis soluções:')
    console.error('   1. Verificar se a aplicação está rodando: npm run dev')
    console.error('   2. Verificar se as variáveis de ambiente estão corretas')
    console.error('   3. Verificar se o Supabase está configurado corretamente')
    console.error('   4. Verificar se as permissões do banco estão corretas')
    process.exit(1)
  }
}

// Executar o teste
testSupabaseMigration()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou:', error)
    process.exit(1)
  })