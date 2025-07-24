// Monitor de banco de dados em tempo real para desenvolvimento
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

class DatabaseMonitor {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    this.isMonitoring = false;
    this.lastCounts = {};
  }

  // Limpar console
  clearScreen() {
    console.clear();
    console.log('🔍 MOOBI CHAT - MONITOR DE BANCO DE DADOS');
    console.log('=' .repeat(60));
    console.log(`⏰ ${new Date().toLocaleString('pt-BR')}\n`);
  }

  // Obter contadores de todas as tabelas
  async getTableCounts() {
    const tables = ['users', 'workspaces', 'workspace_users', 'platforms', 'contacts', 'conversations', 'messages'];
    const counts = {};

    for (const table of tables) {
      try {
        const { count, error } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        counts[table] = error ? 0 : count;
      } catch (e) {
        counts[table] = 0;
      }
    }

    return counts;
  }

  // Obter dados das plataformas
  async getPlatformsData() {
    const { data, error } = await this.supabase
      .from('platforms')
      .select('*')
      .order('created_at', { ascending: false });
    
    return error ? [] : data;
  }

  // Obter conversas recentes
  async getRecentConversations(limit = 5) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        platforms!inner(name, type)
      `)
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    return error ? [] : data;
  }

  // Obter mensagens recentes
  async getRecentMessages(limit = 5) {
    const { data, error } = await this.supabase
      .from('messages')
      .select(`
        *,
        conversations!inner(
          title,
          platforms!inner(name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return error ? [] : data;
  }

  // Exibir estatísticas das tabelas
  displayTableStats(counts) {
    console.log('📊 ESTATÍSTICAS DAS TABELAS:');
    console.log('-' .repeat(40));
    
    Object.entries(counts).forEach(([table, count]) => {
      const lastCount = this.lastCounts[table] || 0;
      const change = count - lastCount;
      const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➖';
      const changeText = change !== 0 ? ` (${change > 0 ? '+' : ''}${change})` : '';
      
      console.log(`${changeIcon} ${table.padEnd(15)} ${count.toString().padStart(3)}${changeText}`);
    });
    
    this.lastCounts = { ...counts };
  }

  // Exibir dados das plataformas
  displayPlatforms(platforms) {
    console.log('\n🔌 PLATAFORMAS ATIVAS:');
    console.log('-' .repeat(40));
    
    if (platforms.length === 0) {
      console.log('   Nenhuma plataforma encontrada');
      return;
    }
    
    platforms.forEach((platform, index) => {
      const status = platform.is_active ? '🟢' : '🔴';
      const type = platform.type === 'WHATSAPP' ? '📱' : '💬';
      
      console.log(`${status} ${type} ${platform.name}`);
      console.log(`   ID: ${platform.id}`);
      
      if (platform.config) {
        const config = platform.config;
        if (config.status) {
          console.log(`   Status: ${config.status}`);
        }
        if (config.instanceName) {
          console.log(`   Instância: ${config.instanceName}`);
        }
        if (config.connectedAt) {
          const connectedTime = new Date(config.connectedAt).toLocaleString('pt-BR');
          console.log(`   Conectada: ${connectedTime}`);
        }
      }
      
      if (index < platforms.length - 1) console.log('');
    });
  }

  // Exibir conversas recentes
  displayRecentConversations(conversations) {
    console.log('\n💬 CONVERSAS RECENTES:');
    console.log('-' .repeat(40));
    
    if (conversations.length === 0) {
      console.log('   Nenhuma conversa encontrada');
      return;
    }
    
    conversations.forEach((conv, index) => {
      const statusIcon = conv.status === 'OPEN' ? '🟢' : conv.status === 'CLOSED' ? '🔴' : '🟡';
      const title = conv.title || 'Sem título';
      const platformName = conv.platforms?.name || 'Desconhecida';
      const updatedTime = new Date(conv.updated_at).toLocaleString('pt-BR');
      
      console.log(`${statusIcon} ${title}`);
      console.log(`   Plataforma: ${platformName}`);
      console.log(`   Atualizada: ${updatedTime}`);
      
      if (index < conversations.length - 1) console.log('');
    });
  }

  // Exibir mensagens recentes
  displayRecentMessages(messages) {
    console.log('\n📨 MENSAGENS RECENTES:');
    console.log('-' .repeat(40));
    
    if (messages.length === 0) {
      console.log('   Nenhuma mensagem encontrada');
      return;
    }
    
    messages.forEach((msg, index) => {
      const directionIcon = msg.direction === 'INCOMING' ? '⬅️' : '➡️';
      const content = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
      const platformName = msg.conversations?.platforms?.name || 'Desconhecida';
      const createdTime = new Date(msg.created_at).toLocaleString('pt-BR');
      
      console.log(`${directionIcon} ${content}`);
      console.log(`   Plataforma: ${platformName}`);
      console.log(`   Enviada: ${createdTime}`);
      
      if (index < messages.length - 1) console.log('');
    });
  }

  // Atualizar dados
  async updateData() {
    try {
      this.clearScreen();
      
      const [counts, platforms, conversations, messages] = await Promise.all([
        this.getTableCounts(),
        this.getPlatformsData(),
        this.getRecentConversations(),
        this.getRecentMessages()
      ]);
      
      this.displayTableStats(counts);
      this.displayPlatforms(platforms);
      this.displayRecentConversations(conversations);
      this.displayRecentMessages(messages);
      
      console.log('\n' + '=' .repeat(60));
      console.log('💡 Pressione Ctrl+C para parar o monitoramento');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error.message);
    }
  }

  // Iniciar monitoramento
  async startMonitoring(intervalSeconds = 5) {
    console.log(`🚀 Iniciando monitoramento (atualização a cada ${intervalSeconds}s)...\n`);
    
    this.isMonitoring = true;
    
    // Primeira atualização
    await this.updateData();
    
    // Configurar intervalo
    const interval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(interval);
        return;
      }
      await this.updateData();
    }, intervalSeconds * 1000);
    
    // Capturar Ctrl+C
    process.on('SIGINT', () => {
      this.isMonitoring = false;
      clearInterval(interval);
      console.log('\n\n👋 Monitoramento interrompido. Até logo!');
      process.exit(0);
    });
  }

  // Executar uma única verificação
  async runOnce() {
    console.log('🔍 Executando verificação única...\n');
    await this.updateData();
    console.log('\n✅ Verificação concluída!');
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const monitor = new DatabaseMonitor();

if (args.includes('--once') || args.includes('-o')) {
  // Executar uma única vez
  monitor.runOnce();
} else {
  // Monitoramento contínuo
  const intervalArg = args.find(arg => arg.startsWith('--interval='));
  const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 5;
  
  monitor.startMonitoring(interval);
}