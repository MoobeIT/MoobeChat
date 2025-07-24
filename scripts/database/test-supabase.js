// Script para testar a conexão com Supabase
// Execute com: node test-supabase.js

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!')
  console.log('Verifique se SUPABASE_URL e SUPABASE_ANON_KEY estão definidas em .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`)
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      console.error('Código do erro:', error.code)
      console.error('Detalhes:', error.details)
      console.error('Hint:', error.hint)
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n📝 A tabela "users" não existe.')
        console.log('Execute o script SQL em supabase-schema.sql no Supabase Dashboard.')
      }
      
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    
    // Testar se as tabelas existem
    const tables = ['users', 'workspaces', 'workspace_users', 'platforms', 'contacts', 'conversations', 'messages']
    
    console.log('\n🔍 Verificando tabelas...')
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (tableError) {
          console.log(`❌ Tabela "${table}" não encontrada`)
        } else {
          console.log(`✅ Tabela "${table}" existe`)
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar tabela "${table}": ${err.message}`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    return false
  }
}

async function testBasicOperations() {
  console.log('\n🧪 Testando operações básicas...')
  
  try {
    // Testar inserção de usuário de teste
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        name: 'Usuário Teste',
        role: 'USER'
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Erro ao inserir usuário:', insertError.message)
      return false
    }
    
    console.log('✅ Usuário criado:', newUser.email)
    
    // Testar busca
    const { data: foundUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single()
    
    if (selectError) {
      console.error('❌ Erro ao buscar usuário:', selectError.message)
      return false
    }
    
    console.log('✅ Usuário encontrado:', foundUser.name)
    
    // Testar atualização
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ name: 'Usuário Teste Atualizado' })
      .eq('id', newUser.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError.message)
      return false
    }
    
    console.log('✅ Usuário atualizado:', updatedUser.name)
    
    // Testar deleção
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id)
    
    if (deleteError) {
      console.error('❌ Erro ao deletar usuário:', deleteError.message)
      return false
    }
    
    console.log('✅ Usuário deletado com sucesso')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro nas operações básicas:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando testes do Supabase...\n')
  
  const connectionOk = await testConnection()
  
  if (connectionOk) {
    const operationsOk = await testBasicOperations()
    
    if (operationsOk) {
      console.log('\n🎉 Todos os testes passaram! Supabase está configurado corretamente.')
      console.log('\n📋 Próximos passos:')
      console.log('1. Execute o schema SQL se alguma tabela estiver faltando')
      console.log('2. Comece a migrar os arquivos de API do Prisma para Supabase')
      console.log('3. Use o MIGRATION_GUIDE.md como referência')
    } else {
      console.log('\n⚠️  Conexão OK, mas operações falharam. Verifique as permissões RLS.')
    }
  } else {
    console.log('\n❌ Falha na conexão. Verifique a configuração.')
  }
}

main().catch(console.error)