// Corretor de problemas de integridade do banco de dados
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

class DatabaseFixer {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  // Corrigir plataformas órfãs
  async fixOrphanPlatforms() {
    console.log('🔧 CORRIGINDO PLATAFORMAS ÓRFÃS');
    console.log('=' .repeat(40));

    // Buscar plataformas órfãs
    const { data: orphanPlatforms } = await this.supabase
      .from('platforms')
      .select(`
        id, name, workspace_id,
        workspaces!left(id, name)
      `)
      .is('workspaces.id', null);

    if (!orphanPlatforms || orphanPlatforms.length === 0) {
      console.log('✅ Nenhuma plataforma órfã encontrada');
      return;
    }

    console.log(`⚠️ Encontradas ${orphanPlatforms.length} plataformas órfãs:`);
    
    for (const platform of orphanPlatforms) {
      console.log(`\n🔍 Processando: ${platform.name} (${platform.id})`);
      console.log(`   Workspace ID inválido: ${platform.workspace_id}`);

      // Buscar um workspace válido
      const { data: validWorkspaces } = await this.supabase
        .from('workspaces')
        .select('id, name')
        .limit(1);

      if (validWorkspaces && validWorkspaces.length > 0) {
        const targetWorkspace = validWorkspaces[0];
        
        console.log(`   ➡️ Movendo para workspace: ${targetWorkspace.name} (${targetWorkspace.id})`);
        
        const { error } = await this.supabase
          .from('platforms')
          .update({ workspace_id: targetWorkspace.id })
          .eq('id', platform.id);

        if (error) {
          console.log(`   ❌ Erro ao corrigir: ${error.message}`);
        } else {
          console.log(`   ✅ Plataforma corrigida com sucesso`);
        }
      } else {
        console.log(`   ❌ Nenhum workspace válido encontrado`);
      }
    }
  }

  // Corrigir conversas órfãs
  async fixOrphanConversations() {
    console.log('\n🔧 CORRIGINDO CONVERSAS ÓRFÃS');
    console.log('=' .repeat(40));

    const { data: orphanConversations } = await this.supabase
      .from('conversations')
      .select(`
        id, title, platform_id,
        platforms!left(id, name)
      `)
      .is('platforms.id', null);

    if (!orphanConversations || orphanConversations.length === 0) {
      console.log('✅ Nenhuma conversa órfã encontrada');
      return;
    }

    console.log(`⚠️ Encontradas ${orphanConversations.length} conversas órfãs`);
    
    for (const conversation of orphanConversations) {
      console.log(`\n🔍 Processando: ${conversation.title || 'Sem título'} (${conversation.id})`);
      console.log(`   Plataforma ID inválida: ${conversation.platform_id}`);
      
      // Opção 1: Tentar encontrar uma plataforma válida
      const { data: validPlatforms } = await this.supabase
        .from('platforms')
        .select('id, name')
        .limit(1);

      if (validPlatforms && validPlatforms.length > 0) {
        const targetPlatform = validPlatforms[0];
        
        console.log(`   ➡️ Movendo para plataforma: ${targetPlatform.name} (${targetPlatform.id})`);
        
        const { error } = await this.supabase
          .from('conversations')
          .update({ platform_id: targetPlatform.id })
          .eq('id', conversation.id);

        if (error) {
          console.log(`   ❌ Erro ao corrigir: ${error.message}`);
        } else {
          console.log(`   ✅ Conversa corrigida com sucesso`);
        }
      } else {
        console.log(`   ⚠️ Nenhuma plataforma válida encontrada - conversa será removida`);
        
        // Remover conversa órfã
        const { error } = await this.supabase
          .from('conversations')
          .delete()
          .eq('id', conversation.id);

        if (error) {
          console.log(`   ❌ Erro ao remover: ${error.message}`);
        } else {
          console.log(`   ✅ Conversa órfã removida`);
        }
      }
    }
  }

  // Corrigir mensagens órfãs
  async fixOrphanMessages() {
    console.log('\n🔧 CORRIGINDO MENSAGENS ÓRFÃS');
    console.log('=' .repeat(40));

    const { data: orphanMessages } = await this.supabase
      .from('messages')
      .select(`
        id, content, conversation_id,
        conversations!left(id, title)
      `)
      .is('conversations.id', null);

    if (!orphanMessages || orphanMessages.length === 0) {
      console.log('✅ Nenhuma mensagem órfã encontrada');
      return;
    }

    console.log(`⚠️ Encontradas ${orphanMessages.length} mensagens órfãs`);
    
    for (const message of orphanMessages) {
      const content = message.content.substring(0, 30) + '...';
      console.log(`\n🔍 Processando: "${content}" (${message.id})`);
      console.log(`   Conversa ID inválida: ${message.conversation_id}`);
      
      // Remover mensagem órfã (mensagens órfãs geralmente devem ser removidas)
      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('id', message.id);

      if (error) {
        console.log(`   ❌ Erro ao remover: ${error.message}`);
      } else {
        console.log(`   ✅ Mensagem órfã removida`);
      }
    }
  }

  // Limpar dados de teste/desenvolvimento
  async cleanTestData() {
    console.log('\n🧹 LIMPANDO DADOS DE TESTE');
    console.log('=' .repeat(40));

    // Remover plataformas de teste
    const testPlatformNames = ['teste', 'test', 'demo', 'development'];
    
    for (const testName of testPlatformNames) {
      const { data: testPlatforms } = await this.supabase
        .from('platforms')
        .select('id, name')
        .ilike('name', `%${testName}%`);

      if (testPlatforms && testPlatforms.length > 0) {
        console.log(`\n🔍 Encontradas ${testPlatforms.length} plataformas de teste com nome "${testName}":`);
        
        for (const platform of testPlatforms) {
          console.log(`   - ${platform.name} (${platform.id})`);
          
          // Confirmar se deve remover (em produção, isso seria interativo)
          console.log(`   ⚠️ Removendo plataforma de teste...`);
          
          // Remover mensagens relacionadas
          await this.supabase
            .from('messages')
            .delete()
            .in('conversation_id', 
              this.supabase
                .from('conversations')
                .select('id')
                .eq('platform_id', platform.id)
            );
          
          // Remover conversas relacionadas
          await this.supabase
            .from('conversations')
            .delete()
            .eq('platform_id', platform.id);
          
          // Remover a plataforma
          const { error } = await this.supabase
            .from('platforms')
            .delete()
            .eq('id', platform.id);

          if (error) {
            console.log(`   ❌ Erro ao remover: ${error.message}`);
          } else {
            console.log(`   ✅ Plataforma de teste removida`);
          }
        }
      }
    }
  }

  // Otimizar banco de dados
  async optimizeDatabase() {
    console.log('\n⚡ OTIMIZANDO BANCO DE DADOS');
    console.log('=' .repeat(40));

    // Verificar conversas sem mensagens
    const { data: emptyConversations } = await this.supabase
      .from('conversations')
      .select(`
        id, title,
        messages(id)
      `);

    if (emptyConversations) {
      const conversationsWithoutMessages = emptyConversations.filter(
        conv => !conv.messages || conv.messages.length === 0
      );

      if (conversationsWithoutMessages.length > 0) {
        console.log(`🔍 Encontradas ${conversationsWithoutMessages.length} conversas vazias`);
        
        for (const conv of conversationsWithoutMessages) {
          console.log(`   - Removendo: ${conv.title || 'Sem título'} (${conv.id})`);
          
          const { error } = await this.supabase
            .from('conversations')
            .delete()
            .eq('id', conv.id);

          if (error) {
            console.log(`   ❌ Erro: ${error.message}`);
          } else {
            console.log(`   ✅ Conversa vazia removida`);
          }
        }
      } else {
        console.log('✅ Nenhuma conversa vazia encontrada');
      }
    }
  }

  // Executar todas as correções
  async runAllFixes() {
    console.log('🚀 INICIANDO CORREÇÃO COMPLETA DO BANCO');
    console.log('=' .repeat(50));
    console.log(`⏰ ${new Date().toLocaleString('pt-BR')}\n`);

    try {
      await this.fixOrphanPlatforms();
      await this.fixOrphanConversations();
      await this.fixOrphanMessages();
      await this.optimizeDatabase();
      
      console.log('\n✅ CORREÇÃO COMPLETA FINALIZADA!');
      console.log('💡 Execute o database-analyzer.js novamente para verificar as correções');
      
    } catch (error) {
      console.error('❌ Erro durante a correção:', error.message);
    }
  }

  // Executar limpeza de dados de teste
  async runTestDataCleanup() {
    console.log('🧹 INICIANDO LIMPEZA DE DADOS DE TESTE');
    console.log('=' .repeat(50));
    console.log(`⏰ ${new Date().toLocaleString('pt-BR')}\n`);

    try {
      await this.cleanTestData();
      
      console.log('\n✅ LIMPEZA DE DADOS DE TESTE FINALIZADA!');
      
    } catch (error) {
      console.error('❌ Erro durante a limpeza:', error.message);
    }
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const fixer = new DatabaseFixer();

if (args.includes('--clean-test')) {
  fixer.runTestDataCleanup();
} else if (args.includes('--orphans-only')) {
  console.log('🔧 Corrigindo apenas dados órfãos...');
  fixer.fixOrphanPlatforms()
    .then(() => fixer.fixOrphanConversations())
    .then(() => fixer.fixOrphanMessages())
    .then(() => console.log('✅ Correção de órfãos finalizada!'));
} else {
  fixer.runAllFixes();
}