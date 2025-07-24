// Analisador avançado de banco de dados para desenvolvimento
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

class DatabaseAnalyzer {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  // Analisar integridade dos dados
  async analyzeDataIntegrity() {
    console.log('🔍 ANÁLISE DE INTEGRIDADE DOS DADOS');
    console.log('=' .repeat(50));

    // Verificar plataformas órfãs (sem workspace)
    const { data: orphanPlatforms } = await this.supabase
      .from('platforms')
      .select(`
        id, name, workspace_id,
        workspaces!left(id, name)
      `)
      .is('workspaces.id', null);

    if (orphanPlatforms && orphanPlatforms.length > 0) {
      console.log('⚠️ Plataformas órfãs encontradas:');
      orphanPlatforms.forEach(p => {
        console.log(`   - ${p.name} (${p.id}) - Workspace: ${p.workspace_id}`);
      });
    } else {
      console.log('✅ Nenhuma plataforma órfã encontrada');
    }

    // Verificar conversas órfãs (sem plataforma)
    const { data: orphanConversations } = await this.supabase
      .from('conversations')
      .select(`
        id, title, platform_id,
        platforms!left(id, name)
      `)
      .is('platforms.id', null);

    if (orphanConversations && orphanConversations.length > 0) {
      console.log('\n⚠️ Conversas órfãs encontradas:');
      orphanConversations.forEach(c => {
        console.log(`   - ${c.title || 'Sem título'} (${c.id}) - Plataforma: ${c.platform_id}`);
      });
    } else {
      console.log('\n✅ Nenhuma conversa órfã encontrada');
    }

    // Verificar mensagens órfãs (sem conversa)
    const { data: orphanMessages } = await this.supabase
      .from('messages')
      .select(`
        id, content, conversation_id,
        conversations!left(id, title)
      `)
      .is('conversations.id', null);

    if (orphanMessages && orphanMessages.length > 0) {
      console.log('\n⚠️ Mensagens órfãs encontradas:');
      orphanMessages.forEach(m => {
        const content = m.content.substring(0, 30) + '...';
        console.log(`   - "${content}" (${m.id}) - Conversa: ${m.conversation_id}`);
      });
    } else {
      console.log('\n✅ Nenhuma mensagem órfã encontrada');
    }
  }

  // Analisar performance e uso
  async analyzePerformance() {
    console.log('\n📊 ANÁLISE DE PERFORMANCE');
    console.log('=' .repeat(50));

    // Conversas mais ativas (por número de mensagens)
    const { data: activeConversations } = await this.supabase
      .rpc('get_conversation_message_counts')
      .limit(5);

    if (!activeConversations) {
      // Fallback: contar mensagens manualmente
      const { data: conversations } = await this.supabase
        .from('conversations')
        .select(`
          id, title,
          platforms(name),
          messages(id)
        `);

      if (conversations) {
        const conversationsWithCounts = conversations
          .map(c => ({
            ...c,
            message_count: c.messages ? c.messages.length : 0
          }))
          .sort((a, b) => b.message_count - a.message_count)
          .slice(0, 5);

        console.log('💬 Conversas mais ativas:');
        conversationsWithCounts.forEach((conv, index) => {
          const title = conv.title || 'Sem título';
          const platform = conv.platforms?.name || 'Desconhecida';
          console.log(`   ${index + 1}. ${title} (${platform}) - ${conv.message_count} mensagens`);
        });
      }
    }

    // Plataformas por número de conversas
    const { data: platforms } = await this.supabase
      .from('platforms')
      .select(`
        id, name, type,
        conversations(id)
      `);

    if (platforms) {
      console.log('\n🔌 Plataformas por atividade:');
      platforms
        .map(p => ({
          ...p,
          conversation_count: p.conversations ? p.conversations.length : 0
        }))
        .sort((a, b) => b.conversation_count - a.conversation_count)
        .forEach((platform, index) => {
          const typeIcon = platform.type === 'WHATSAPP' ? '📱' : '💬';
          console.log(`   ${index + 1}. ${typeIcon} ${platform.name} - ${platform.conversation_count} conversas`);
        });
    }
  }

  // Analisar dados de uma plataforma específica
  async analyzePlatform(platformId) {
    console.log(`\n🔍 ANÁLISE DETALHADA DA PLATAFORMA: ${platformId}`);
    console.log('=' .repeat(50));

    const { data: platform } = await this.supabase
      .from('platforms')
      .select(`
        *,
        workspaces(id, name),
        conversations(
          id, title, status, created_at, updated_at,
          messages(id, direction, type, created_at)
        )
      `)
      .eq('id', platformId)
      .single();

    if (!platform) {
      console.log('❌ Plataforma não encontrada');
      return;
    }

    console.log(`📱 Nome: ${platform.name}`);
    console.log(`🏢 Workspace: ${platform.workspaces?.name || 'Desconhecido'}`);
    console.log(`📊 Status: ${platform.is_active ? 'Ativa' : 'Inativa'}`);
    console.log(`📅 Criada: ${new Date(platform.created_at).toLocaleString('pt-BR')}`);

    if (platform.config) {
      console.log('\n⚙️ Configuração:');
      Object.entries(platform.config).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 50) {
          console.log(`   ${key}: ${value.substring(0, 50)}...`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
    }

    if (platform.conversations) {
      console.log(`\n💬 Conversas: ${platform.conversations.length}`);
      
      const totalMessages = platform.conversations.reduce((total, conv) => {
        return total + (conv.messages ? conv.messages.length : 0);
      }, 0);
      
      console.log(`📨 Total de mensagens: ${totalMessages}`);

      // Estatísticas por direção
      const messageStats = platform.conversations.reduce((stats, conv) => {
        if (conv.messages) {
          conv.messages.forEach(msg => {
            stats[msg.direction] = (stats[msg.direction] || 0) + 1;
          });
        }
        return stats;
      }, {});

      if (Object.keys(messageStats).length > 0) {
        console.log('\n📊 Mensagens por direção:');
        Object.entries(messageStats).forEach(([direction, count]) => {
          const icon = direction === 'INCOMING' ? '⬅️' : '➡️';
          console.log(`   ${icon} ${direction}: ${count}`);
        });
      }

      // Conversas mais recentes
      const recentConversations = platform.conversations
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 3);

      if (recentConversations.length > 0) {
        console.log('\n🕒 Conversas mais recentes:');
        recentConversations.forEach((conv, index) => {
          const title = conv.title || 'Sem título';
          const messageCount = conv.messages ? conv.messages.length : 0;
          const lastUpdate = new Date(conv.updated_at).toLocaleString('pt-BR');
          console.log(`   ${index + 1}. ${title} (${messageCount} msgs) - ${lastUpdate}`);
        });
      }
    }
  }

  // Verificar configuração do ambiente
  async checkEnvironment() {
    console.log('\n🔧 VERIFICAÇÃO DO AMBIENTE');
    console.log('=' .repeat(50));

    // Verificar conexão com Supabase
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        console.log('❌ Erro na conexão com Supabase:', error.message);
      } else {
        console.log('✅ Conexão com Supabase: OK');
      }
    } catch (e) {
      console.log('❌ Erro na conexão:', e.message);
    }

    // Verificar variáveis de ambiente
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'NEXTAUTH_SECRET',
      'UAZAPI_URL',
      'UAZAPI_TOKEN'
    ];

    console.log('\n🔐 Variáveis de ambiente:');
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        const displayValue = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('TOKEN')
          ? value.substring(0, 10) + '...'
          : value;
        console.log(`   ✅ ${varName}: ${displayValue}`);
      } else {
        console.log(`   ❌ ${varName}: Não definida`);
      }
    });
  }

  // Executar análise completa
  async runFullAnalysis(platformId = null) {
    console.log('🚀 ANÁLISE COMPLETA DO BANCO DE DADOS');
    console.log('=' .repeat(60));
    console.log(`⏰ ${new Date().toLocaleString('pt-BR')}\n`);

    await this.checkEnvironment();
    await this.analyzeDataIntegrity();
    await this.analyzePerformance();

    if (platformId) {
      await this.analyzePlatform(platformId);
    }

    console.log('\n✅ Análise completa finalizada!');
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const analyzer = new DatabaseAnalyzer();

if (args.length === 0) {
  // Análise completa
  analyzer.runFullAnalysis();
} else if (args[0] === '--platform' && args[1]) {
  // Análise de plataforma específica
  analyzer.runFullAnalysis(args[1]);
} else if (args[0] === '--integrity') {
  // Apenas integridade
  analyzer.analyzeDataIntegrity();
} else if (args[0] === '--performance') {
  // Apenas performance
  analyzer.analyzePerformance();
} else if (args[0] === '--env') {
  // Apenas ambiente
  analyzer.checkEnvironment();
} else {
  console.log('📖 Uso:');
  console.log('  node database-analyzer.js                    # Análise completa');
  console.log('  node database-analyzer.js --platform <id>    # Análise de plataforma específica');
  console.log('  node database-analyzer.js --integrity        # Apenas integridade dos dados');
  console.log('  node database-analyzer.js --performance      # Apenas análise de performance');
  console.log('  node database-analyzer.js --env              # Apenas verificação do ambiente');
}