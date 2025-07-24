// Script para verificar o schema atual do Supabase
// Execute com: node scripts/database/verificar-schema-atual.js

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

async function verificarSchemaAtual() {
  console.log('🔍 Verificando schema atual do Supabase...')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...\n`)
  
  // Lista de tabelas esperadas
  const tabelasEsperadas = [
    'users',
    'workspaces', 
    'workspace_users',
    'platforms',
    'contacts',
    'conversations',
    'messages',
    'kanban_boards',
    'kanban_columns',
    'kanban_cards'
  ]
  
  const tabelasExistentes = []
  const tabelasAusentes = []
  
  console.log('📋 Verificando tabelas...')
  
  for (const tabela of tabelasEsperadas) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('count')
        .limit(1)
      
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          console.log(`❌ Tabela "${tabela}" NÃO existe`)
          tabelasAusentes.push(tabela)
        } else if (error.code === '42501') {
          console.log(`⚠️  Tabela "${tabela}" existe mas sem permissões (RLS não configurado)`)
          tabelasExistentes.push(tabela)
        } else {
          console.log(`❓ Tabela "${tabela}" - Erro: ${error.message} (${error.code})`)
          tabelasAusentes.push(tabela)
        }
      } else {
        console.log(`✅ Tabela "${tabela}" existe e funcional`)
        tabelasExistentes.push(tabela)
      }
    } catch (err) {
      console.log(`❌ Erro ao verificar tabela "${tabela}": ${err.message}`)
      tabelasAusentes.push(tabela)
    }
  }
  
  console.log('\n📊 RESUMO DO SCHEMA:')
  console.log(`✅ Tabelas existentes: ${tabelasExistentes.length}/${tabelasEsperadas.length}`)
  console.log(`❌ Tabelas ausentes: ${tabelasAusentes.length}/${tabelasEsperadas.length}`)
  
  if (tabelasExistentes.length > 0) {
    console.log('\n✅ TABELAS EXISTENTES:')
    tabelasExistentes.forEach(tabela => console.log(`   - ${tabela}`))
  }
  
  if (tabelasAusentes.length > 0) {
    console.log('\n❌ TABELAS AUSENTES:')
    tabelasAusentes.forEach(tabela => console.log(`   - ${tabela}`))
  }
  
  // Verificar estrutura das tabelas existentes
  if (tabelasExistentes.length > 0) {
    console.log('\n🔍 VERIFICANDO ESTRUTURA DAS TABELAS EXISTENTES...')
    
    for (const tabela of tabelasExistentes.slice(0, 3)) { // Verificar apenas as 3 primeiras
      try {
        console.log(`\n📋 Estrutura da tabela "${tabela}":`)
        
        // Tentar fazer uma consulta para ver os campos
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ⚠️  Erro ao acessar: ${error.message}`)
        } else {
          if (data && data.length > 0) {
            const campos = Object.keys(data[0])
            console.log(`   ✅ Campos encontrados: ${campos.join(', ')}`)
          } else {
            console.log(`   ℹ️  Tabela vazia, mas estrutura OK`)
          }
        }
      } catch (err) {
        console.log(`   ❌ Erro: ${err.message}`)
      }
    }
  }
  
  // Recomendações
  console.log('\n💡 RECOMENDAÇÕES:')
  
  if (tabelasAusentes.length === tabelasEsperadas.length) {
    console.log('🚨 NENHUMA tabela encontrada - Execute o schema completo:')
    console.log('   1. Acesse o Supabase Dashboard')
    console.log('   2. Vá para SQL Editor')
    console.log('   3. Execute todas as 6 etapas do arquivo supabase-schema-step-by-step.sql')
  } else if (tabelasAusentes.length > 0) {
    console.log('⚠️  SCHEMA PARCIAL - Execute apenas as etapas faltantes:')
    console.log('   1. Acesse o Supabase Dashboard')
    console.log('   2. Vá para SQL Editor')
    console.log('   3. Execute apenas as etapas que criam as tabelas ausentes')
  } else {
    console.log('✅ TODAS as tabelas existem!')
    console.log('   Se ainda há erros de login, pode ser problema de RLS (Row Level Security)')
    console.log('   Execute a ETAPA 6 do schema (RLS e políticas)')
  }
  
  console.log('\n📁 Arquivos de referência:')
  console.log('   - Schema completo: scripts/database/supabase-schema-step-by-step.sql')
  console.log('   - Solução de erros: docs/troubleshooting/SOLUCAO-ERRO-BANCO.md')
  
  return {
    existentes: tabelasExistentes,
    ausentes: tabelasAusentes,
    total: tabelasEsperadas.length
  }
}

// Executar verificação
verificarSchemaAtual()
  .then(resultado => {
    console.log('\n🎯 VERIFICAÇÃO CONCLUÍDA!')
    
    if (resultado.ausentes.length === 0) {
      console.log('✅ Schema completo - Pronto para usar!')
      process.exit(0)
    } else {
      console.log(`⚠️  Schema incompleto - ${resultado.ausentes.length} tabelas faltando`)
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Erro na verificação:', error.message)
    process.exit(1)
  })