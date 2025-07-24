import { userOperations, workspaceOperationsExtended } from './database'
import { supabaseTyped } from './supabase'

export async function ensureUserWorkspace(userId: string, userEmail?: string, userName?: string) {
  console.log('🔍 Debug - ensureUserWorkspace chamado com:', { userId, userEmail, userName })
  
  // Buscar usuário por ID
  let user = await userOperations.findById(userId)

  // Se não encontrou por ID, tentar por email
  if (!user && userEmail) {
    console.log('👤 Usuário não encontrado por ID, buscando por email:', userEmail)
    user = await userOperations.findByEmail(userEmail)
    
    if (user) {
      console.log('✅ Usuário encontrado por email, usando ID correto:', user.id)
      userId = user.id // Atualizar para usar o ID correto
    }
  }

  // Se ainda não existe, criar o usuário
  if (!user && userEmail) {
    console.log('👤 Criando novo usuário:', userEmail)
    try {
      user = await userOperations.create({
        email: userEmail,
        name: userName || undefined,
        role: 'USER'
      })
      
      if (!user) {
        throw new Error('Erro ao criar usuário')
      }
      
      console.log('✅ Usuário criado:', user.id)
      userId = user.id // Garantir que usamos o ID correto
    } catch (createError) {
      console.error('❌ Erro ao criar usuário:', createError)
      
      // Última tentativa: buscar novamente
      if (userEmail) {
        user = await userOperations.findByEmail(userEmail)
      }
      
      if (user) {
        console.log('✅ Usuário encontrado na segunda tentativa:', user.id)
        userId = user.id
      } else {
        throw new Error(`Erro ao criar usuário: ${createError instanceof Error ? createError.message : 'Erro desconhecido'}`)
      }
    }
  }

  if (!user) {
    throw new Error('Usuário não encontrado e não foi possível criar')
  }

  // Buscar workspaces do usuário
  const userWorkspaces = await workspaceOperationsExtended.findUserWorkspaces(user.id)
  
  console.log('🔍 Workspaces encontrados:', userWorkspaces.length)

  if (userWorkspaces.length === 0) {
    console.log('🏢 Criando workspace para usuário:', userEmail || userId)
    
    // Criar workspace padrão
    const { data: workspace, error: workspaceError } = await supabaseTyped
      .from('workspaces')
      .insert({
        name: `${userName || userEmail || 'Usuário'} - Workspace`,
        description: 'Workspace criado automaticamente'
      })
      .select()
      .single()

    if (workspaceError || !workspace) {
      throw new Error('Erro ao criar workspace')
    }

    // Associar usuário ao workspace como OWNER
    const { error: workspaceUserError } = await supabaseTyped
      .from('workspace_users')
      .insert({
        user_id: user.id,
        workspace_id: workspace.id,
        role: 'OWNER'
      })

    if (workspaceUserError) {
      throw new Error('Erro ao associar usuário ao workspace')
    }

    // Criar board Kanban padrão
    const { data: board, error: boardError } = await supabaseTyped
      .from('kanban_boards')
      .insert({
        workspace_id: workspace.id,
        name: 'Atendimento',
        description: 'Board principal de atendimento',
        is_default: true
      })
      .select()
      .single()

    if (boardError || !board) {
      console.error('Erro ao criar board:', boardError)
    } else {
      // Criar colunas do Kanban
      const columns = [
        { name: 'Novo', color: '#3B82F6', position: 0 },
        { name: 'Em Andamento', color: '#F59E0B', position: 1 },
        { name: 'Aguardando', color: '#8B5CF6', position: 2 },
        { name: 'Resolvido', color: '#10B981', position: 3 }
      ]

      for (const column of columns) {
        await supabaseTyped
          .from('kanban_columns')
          .insert({
            board_id: board.id,
            name: column.name,
            color: column.color,
            position: column.position
          })
      }
    }

    console.log('✅ Workspace criado:', workspace.id)
    return workspace
  }

  // Buscar workspace completo
  const { data: workspace } = await supabaseTyped
    .from('workspaces')
    .select('*')
    .eq('id', userWorkspaces[0].workspace_id)
    .single()

  return workspace
}