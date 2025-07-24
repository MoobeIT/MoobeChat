const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlatforms() {
  try {
    console.log('🔍 Verificando plataformas no banco de dados...');
    
    // Buscar todas as plataformas
    const { data: platforms, error } = await supabase
      .from('platforms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar plataformas:', error);
      return;
    }
    
    console.log(`📊 Total de plataformas encontradas: ${platforms.length}`);
    
    if (platforms.length === 0) {
      console.log('✅ Nenhuma plataforma encontrada no banco.');
      return;
    }
    
    // Agrupar por workspace e nome para encontrar duplicatas
    const platformsByWorkspace = {};
    const duplicates = [];
    
    platforms.forEach(platform => {
      const key = `${platform.workspace_id}_${platform.name}`;
      
      if (!platformsByWorkspace[key]) {
        platformsByWorkspace[key] = [];
      }
      
      platformsByWorkspace[key].push(platform);
      
      if (platformsByWorkspace[key].length > 1) {
        duplicates.push({
          workspaceId: platform.workspace_id,
          name: platform.name,
          platforms: platformsByWorkspace[key]
        });
      }
    });
    
    // Mostrar todas as plataformas
    console.log('\n📋 Lista de plataformas:');
    platforms.forEach((platform, index) => {
      console.log(`${index + 1}. ID: ${platform.id}`);
      console.log(`   Nome: ${platform.name}`);
      console.log(`   Tipo: ${platform.type}`);
      console.log(`   Workspace: ${platform.workspace_id}`);
      console.log(`   Ativa: ${platform.is_active}`);
      console.log(`   Criada em: ${platform.created_at}`);
      console.log('   ---');
    });
    
    // Verificar duplicatas
    if (duplicates.length > 0) {
      console.log('\n⚠️ Plataformas duplicadas encontradas:');
      duplicates.forEach(duplicate => {
        console.log(`\n🔄 Workspace: ${duplicate.workspaceId}, Nome: "${duplicate.name}"`);
        duplicate.platforms.forEach((platform, index) => {
          console.log(`   ${index + 1}. ID: ${platform.id} (${platform.created_at})`);
        });
      });
      
      console.log('\n💡 Para remover duplicatas, execute:');
      console.log('node scripts/clean-duplicate-platforms.js');
    } else {
      console.log('\n✅ Nenhuma duplicata encontrada.');
    }
    
    // Verificar plataformas órfãs (sem workspace válido)
    console.log('\n🔍 Verificando workspaces...');
    const { data: workspaces, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id');
    
    if (workspaceError) {
      console.error('❌ Erro ao buscar workspaces:', workspaceError);
      return;
    }
    
    const validWorkspaceIds = new Set(workspaces.map(w => w.id));
    const orphanPlatforms = platforms.filter(p => !validWorkspaceIds.has(p.workspace_id));
    
    if (orphanPlatforms.length > 0) {
      console.log('\n🚨 Plataformas órfãs encontradas (workspace inexistente):');
      orphanPlatforms.forEach(platform => {
        console.log(`   - ID: ${platform.id}, Nome: ${platform.name}, Workspace: ${platform.workspace_id}`);
      });
    } else {
      console.log('\n✅ Nenhuma plataforma órfã encontrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkPlatforms();