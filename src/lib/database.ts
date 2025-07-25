import { supabaseTyped } from './supabase'
import { userOperations as baseUserOperations, workspaceOperations } from './auth-supabase'

// Re-exportar userOperations para compatibilidade
export { userOperations } from './auth-supabase'

// Tipos para as tabelas adicionais que não estavam no schema inicial
export type Platform = {
  id: string
  name: string
  type: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK'
  config: any
  workspace_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string
  name: string
  phone?: string
  email?: string
  platform_id: string
  workspace_id: string
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  workspace_id: string
  platform_id: string
  external_id: string
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  status: 'OPEN' | 'CLOSED' | 'PENDING'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assigned_to?: string
  tags?: string[]
  last_message_at?: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string
  external_id?: string
  content: string
  message_type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT'
  direction: 'INCOMING' | 'OUTGOING'
  sender_name?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export type KanbanBoard = {
  id: string
  name: string
  workspace_id: string
  is_default?: boolean | null
  created_at: string
  updated_at: string
}

export type KanbanColumn = {
  id: string
  name: string
  position: number
  board_id: string
  created_at: string
  updated_at: string
}

export type KanbanCard = {
  id: string
  position: number
  column_id: string
  conversation_id: string
  created_at: string
  updated_at: string
}

// Operações com Platforms
export const platformOperations = {
  async findById(id: string) {
    const { data, error } = await supabaseTyped
      .from('platforms')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },

  async findByInstanceId(instanceName: string) {
    const { data, error } = await supabaseTyped
      .from('platforms')
      .select('*')
      .eq('type', 'WHATSAPP')
    
    if (error) return null
    
    // Buscar pela configuração da instância
    const platform = data?.find(p => {
      const config = p.config as any
      return config?.instanceName === instanceName || 
             config?.instanceId === instanceName
    })
    
    return platform || null
  },

  async findFirst(where: any) {
    let query = supabaseTyped.from('platforms').select('*')
    
    if (where.workspace_id) {
      query = query.eq('workspace_id', where.workspace_id)
    }
    if (where.type) {
      query = query.eq('type', where.type)
    }
    if (where.id) {
      query = query.eq('id', where.id)
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async findMany(where: any = {}) {
    let query = supabaseTyped.from('platforms').select('*')
    
    if (where.workspace_id) {
      query = query.eq('workspace_id', where.workspace_id)
    }
    if (where.type) {
      query = query.eq('type', where.type)
    }
    
    const { data, error } = await query
    if (error) return []
    return data || []
  },

  async create(data: Omit<Platform, 'created_at' | 'updated_at'> & { id?: string }) {
    const now = new Date().toISOString()
    const dataWithTimestamps = {
      ...data,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('platforms')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async update(where: { id: string }, data: Partial<Platform>) {
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString()
    }
    
    const { data: result, error } = await supabaseTyped
      .from('platforms')
      .update(dataWithTimestamp)
      .eq('id', where.id)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async delete(where: { id: string }) {
    const { error } = await supabaseTyped
      .from('platforms')
      .delete()
      .eq('id', where.id)
    
    if (error) throw error
    return true
  }
}

// Operações com Contacts
export const contactOperations = {
  async findById(id: string) {
    const { data, error } = await supabaseTyped
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },

  async findFirst(where: any) {
    let query = supabaseTyped.from('contacts').select('*')
    
    if (where.id) {
      query = query.eq('id', where.id)
    }
    if (where.phone) {
      query = query.eq('phone', where.phone)
    }
    if (where.platform_id) {
      query = query.eq('platform_id', where.platform_id)
    }
    if (where.workspace_id) {
      query = query.eq('workspace_id', where.workspace_id)
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async findMany(where: any = {}) {
    let query = supabaseTyped.from('contacts').select('*')
    
    if (where.workspace_id) {
      query = query.eq('workspace_id', where.workspace_id)
    }
    if (where.platform_id) {
      query = query.eq('platform_id', where.platform_id)
    }
    
    const { data, error } = await query
    if (error) return []
    return data || []
  },

  async create(data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    const dataWithTimestamps = {
      ...data,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('contacts')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async update(where: { id: string }, data: Partial<Contact>) {
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString()
    }
    
    const { data: result, error } = await supabaseTyped
      .from('contacts')
      .update(dataWithTimestamp)
      .eq('id', where.id)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async delete(where: { id: string }) {
    const { error } = await supabaseTyped
      .from('contacts')
      .delete()
      .eq('id', where.id)
    
    if (error) throw error
    return true
  }
}

// Operações com Conversations
export const conversationOperations = {
  async findById(id: string) {
    const { data, error } = await supabaseTyped
      .from('conversations')
      .select(`
        *,
        platform:platforms(*),
        messages(id, content, created_at, message_type, sender_name)
      `)
      .eq('id', id)
      .single()
    
    if (error) return null
    
    // Adicionar _count para compatibilidade
    if (data) {
      data._count = {
        messages: data.messages ? data.messages.length : 0
      }
      
      // Ordenar mensagens por data (mais recente primeiro)
      if (data.messages) {
        data.messages.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
    }
    
    return data
  },

  async findByExternalId(externalId: string, instanceName: string) {
    // Primeiro buscar a plataforma
    const platform = await platformOperations.findByInstanceId(instanceName)
    if (!platform) return null
    
    const { data, error } = await supabaseTyped
      .from('conversations')
      .select('*')
      .eq('external_id', externalId)
      .eq('platform_id', platform.id)
      .single()
    
    if (error) return null
    return data
  },

  async findFirst(where: any) {
    let query = supabaseTyped.from('conversations').select('*')
    
    if (where.id) {
      query = query.eq('id', where.id)
    }
    if (where.contact_id) {
      query = query.eq('contact_id', where.contact_id)
    }
    if (where.platform_id) {
      query = query.eq('platform_id', where.platform_id)
    }
    if (where.workspace_id) {
      query = query.eq('workspace_id', where.workspace_id)
    }
    if (where.external_id) {
      query = query.eq('external_id', where.external_id)
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async findUnique(where: { id: string }) {
    const { data, error } = await supabaseTyped
      .from('conversations')
      .select('*')
      .eq('id', where.id)
      .single()
    
    if (error) return null
    return data
  },

  async findMany(where: any = {}) {
    let query = supabaseTyped.from('conversations').select('*')
    
    if (where.workspace_id) {
      query = query.eq('workspace_id', where.workspace_id)
    }
    if (where.platform_id) {
      query = query.eq('platform_id', where.platform_id)
    }
    
    const { data, error } = await query
    if (error) return []
    return data || []
  },

  async create(data: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    const dataWithTimestamps = {
      ...data,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('conversations')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async update(where: { id: string } | string, data: Partial<Conversation>) {
    const id = typeof where === 'string' ? where : where.id
    
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString()
    }
    
    const { data: result, error } = await supabaseTyped
      .from('conversations')
      .update(dataWithTimestamp)
      .eq('id', id)
      .select(`
        *,
        platform:platforms(*),
        messages(id, content, created_at, message_type, sender_name)
      `)
      .single()
    
    if (error) throw error
    
    // Adicionar _count para compatibilidade
    if (result) {
      result._count = {
        messages: result.messages ? result.messages.length : 0
      }
      
      // Ordenar mensagens por data (mais recente primeiro)
      if (result.messages) {
        result.messages.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
    }
    
    return result
  },

  async delete(id: string) {
    const { error } = await supabaseTyped
      .from('conversations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Operações com Messages
export const messageOperations = {
  async findFirst(where: any) {
    let query = supabaseTyped.from('messages').select('*')
    
    if (where.id) {
      query = query.eq('id', where.id)
    }
    if (where.conversation_id) {
      query = query.eq('conversation_id', where.conversation_id)
    }
    if (where.platform_message_id) {
      query = query.eq('platform_message_id', where.platform_message_id)
    }
    if (where.external_id) {
      query = query.eq('external_id', where.external_id)
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async findMany(where: any = {}, options: any = {}) {
    let query = supabaseTyped.from('messages').select('*')
    
    if (where.conversation_id) {
      query = query.eq('conversation_id', where.conversation_id)
    }
    
    if (options.orderBy) {
      const { created_at } = options.orderBy
      if (created_at === 'asc') {
        query = query.order('created_at', { ascending: true })
      } else if (created_at === 'desc') {
        query = query.order('created_at', { ascending: false })
      }
    }
    
    if (options.take) {
      query = query.limit(options.take)
    }
    
    const { data, error } = await query
    if (error) return []
    return data || []
  },

  async create(data: Omit<Message, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    const messageId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    
    const dataWithTimestamps = {
      id: messageId,
      ...data,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('messages')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async update(where: { id: string }, data: Partial<Message>) {
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date().toISOString()
    }
    
    const { data: result, error } = await supabaseTyped
      .from('messages')
      .update(dataWithTimestamp)
      .eq('id', where.id)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async delete(id: string) {
    const { error } = await supabaseTyped
      .from('messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Operações com Kanban
export const kanbanOperations = {
  board: {
    async findFirst(where: any) {
      let query = supabaseTyped.from('kanban_boards').select('*')
      
      if (where.workspace_id) {
        query = query.eq('workspace_id', where.workspace_id)
      }
      if (where.id) {
        query = query.eq('id', where.id)
      }
      
      const { data, error } = await query.single()
      if (error) return null
      return data
    },

    async create(data: Omit<KanbanBoard, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    const boardId = `board_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    
    const dataWithTimestamps = {
      id: boardId,
      ...data,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('kanban_boards')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    return result
  }
  },

  column: {
    async findUnique(where: { id: string }) {
      const { data, error } = await supabaseTyped
        .from('kanban_columns')
        .select('*')
        .eq('id', where.id)
        .single()
      
      if (error) return null
      return data
    }
  },

  card: {
    async findById(id: string) {
      const { data, error } = await supabaseTyped
        .from('kanban_cards')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) return null
      return data
    },

    async findFirst(where: any) {
      let query = supabaseTyped.from('kanban_cards').select('*')
      
      if (where.conversation_id) {
        query = query.eq('conversation_id', where.conversation_id)
      }
      
      const { data, error } = await query.single()
      if (error) return null
      return data
    },

    async count(where: any) {
      let query = supabaseTyped.from('kanban_cards').select('*', { count: 'exact', head: true })
      
      if (where.column_id) {
        query = query.eq('column_id', where.column_id)
      }
      
      const { count, error } = await query
      if (error) return 0
      return count || 0
    },

    async create(data: Omit<KanbanCard, 'id' | 'created_at' | 'updated_at'>) {
      const now = new Date().toISOString()
      const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
      
      const dataWithTimestamps = {
        id: cardId,
        position: data.position,
        column_id: data.column_id,
        conversation_id: data.conversation_id,
        created_at: now,
        updated_at: now
      }
      
      const { data: result, error } = await supabaseTyped
        .from('kanban_cards')
        .insert(dataWithTimestamps)
        .select()
        .single()
      
      if (error) throw error
      return result
    },

    async update(where: { id: string }, data: Partial<KanbanCard>) {
      const dataWithTimestamp = {
        ...data,
        updated_at: new Date().toISOString()
      }
      
      const { data: result, error } = await supabaseTyped
        .from('kanban_cards')
        .update(dataWithTimestamp)
        .eq('id', where.id)
        .select()
        .single()
      
      if (error) throw error
      return result
    },

    async findMany(where: any = {}) {
      let query = supabaseTyped.from('kanban_cards').select('*')
      
      if (where.conversation_id) {
        query = query.eq('conversation_id', where.conversation_id)
      }
      if (where.column_id) {
        query = query.eq('column_id', where.column_id)
      }
      
      const { data, error } = await query
      if (error) return []
      return data || []
    },

    async delete(where: { id: string }) {
      const { error } = await supabaseTyped
        .from('kanban_cards')
        .delete()
        .eq('id', where.id)
      
      if (error) throw error
      return true
    }
  }
}

// Operações com Users (adicionais)
const userOperationsExtended = {
  ...baseUserOperations,
  
  async findUnique(where: { id?: string; email?: string }) {
    let query = supabaseTyped.from('users').select('*')
    
    if (where.id) {
      query = query.eq('id', where.id)
    } else if (where.email) {
      query = query.eq('email', where.email)
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async findMany(where: any = {}) {
    let query = supabaseTyped.from('users').select('*')
    
    if (where.role) {
      query = query.eq('role', where.role)
    }
    
    const { data, error } = await query
    if (error) return []
    return data || []
  },

  async upsert(options: { where: { email: string }, update: any, create: any }) {
    // Primeiro tenta encontrar
    const existing = await this.findUnique({ email: options.where.email })
    
    if (existing) {
      // Atualiza se existe
      const { data, error } = await supabaseTyped
        .from('users')
        .update(options.update)
        .eq('email', options.where.email)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Cria se não existe
      const { data, error } = await supabaseTyped
        .from('users')
        .insert(options.create)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  async delete(where: { id: string }) {
    const { error } = await supabaseTyped
      .from('users')
      .delete()
      .eq('id', where.id)
    
    if (error) throw error
    return true
  }
}

// Operações com Workspaces (adicionais)
const workspaceOperationsExtended = {
  ...workspaceOperations,
  
  async findFirst(where: any) {
    let query = supabaseTyped.from('workspaces').select('*')
    
    if (where.users?.some) {
      // Para queries complexas com relacionamentos, precisamos fazer join manual
      const { data: workspaceUsers } = await supabaseTyped
        .from('workspace_users')
        .select('workspace_id')
        .eq('user_id', where.users.some.userId)
      
      if (workspaceUsers && workspaceUsers.length > 0) {
        query = query.eq('id', workspaceUsers[0].workspace_id)
      } else {
        return null
      }
    }
    
    const { data, error } = await query.single()
    if (error) return null
    return data
  },

  async findUserWorkspaces(userId: string) {
    const { data: workspaceUsers, error } = await supabaseTyped
      .from('workspace_users')
      .select(`
        workspace_id,
        role,
        workspace:workspaces(*)
      `)
      .eq('user_id', userId)
    
    if (error) return []
    return workspaceUsers || []
  },

  async create(data: { data: Omit<any, 'id' | 'created_at' | 'updated_at'> }) {
    const { data: result, error } = await supabaseTyped
      .from('workspaces')
      .insert(data.data)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async createWithUser(data: { name: string; description?: string; userId: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER' }) {
    // Criar workspace
    const workspaceId = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const { data: workspace, error: workspaceError } = await supabaseTyped
      .from('workspaces')
      .insert({
        id: workspaceId,
        name: data.name,
        description: data.description || '',
        updated_at: now
      })
      .select()
      .single()
    
    if (workspaceError) throw workspaceError

    // Associar usuário ao workspace
    const workspaceUserId = `wu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { error: workspaceUserError } = await supabaseTyped
      .from('workspace_users')
      .insert({
        id: workspaceUserId,
        user_id: data.userId,
        workspace_id: workspace.id,
        role: data.role || 'OWNER',
        updated_at: now
      })
    
    if (workspaceUserError) {
      // Se falhar ao associar usuário, deletar workspace criado
      await supabaseTyped.from('workspaces').delete().eq('id', workspace.id)
      throw workspaceUserError
    }

    return workspace
  }
}

// Operações com WorkspaceUser
export const workspaceUserOperations = {
  async findMany(where: any = {}) {
    let query = supabaseTyped.from('workspace_users').select('*')
    
    if (where.user_id) {
      query = query.eq('user_id', where.user_id)
    }
    
    const { data, error } = await query
    if (error) return []
    return data || []
  },

  async create(data: { data: Omit<any, 'id' | 'created_at' | 'updated_at'> }) {
    const { data: result, error } = await supabaseTyped
      .from('workspace_users')
      .insert(data.data)
      .select()
      .single()
    
    if (error) throw error
    return result
  }
}

// Operações com Kanban Board (adicionais)
const kanbanBoardOperationsExtended = {
  ...kanbanOperations.board,
  
  async findByWorkspaceId(workspaceId: string) {
    const { data, error } = await supabaseTyped
      .from('kanban_boards')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()
    
    if (error) return null
    return data
  },
  
  async create(data: Omit<KanbanBoard, 'id' | 'created_at' | 'updated_at'> | { data: Omit<KanbanBoard, 'id' | 'created_at' | 'updated_at'> & { isDefault?: boolean } }) {
    const boardData = 'data' in data ? data.data : data
    const now = new Date().toISOString()
    const boardId = `board_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    
    const dataWithTimestamps = {
      id: boardId,
      ...boardData,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('kanban_boards')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    
    // Criar colunas padrão automaticamente
    const defaultColumns = [
      { name: 'Início', position: 0, color: '#10B981' },
      { name: 'Em Andamento', position: 1, color: '#F59E0B' },
      { name: 'Aguardando', position: 2, color: '#EF4444' },
      { name: 'Resolvido', position: 3, color: '#6366F1' }
    ]
    
    for (const column of defaultColumns) {
      const columnId = `column_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
      await supabaseTyped
        .from('kanban_columns')
        .insert({
          id: columnId,
          name: column.name,
          position: column.position,
          board_id: boardId,
          color: column.color,
          created_at: now,
          updated_at: now
        })
    }
    
    console.log(`Board criado com colunas padrão: ${boardId}`)
    return result
  }
}

// Operações com Kanban Column (adicionais)
const kanbanColumnOperationsExtended = {
  ...kanbanOperations.column,
  
  async findById(id: string) {
    const { data, error } = await supabaseTyped
      .from('kanban_columns')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  },
  
  async create(data: { data: Omit<KanbanColumn, 'id' | 'created_at' | 'updated_at'> & { color?: string } }) {
    const now = new Date().toISOString()
    const columnId = `column_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    
    const dataWithTimestamps = {
      id: columnId,
      ...data.data,
      created_at: now,
      updated_at: now
    }
    
    const { data: result, error } = await supabaseTyped
      .from('kanban_columns')
      .insert(dataWithTimestamps)
      .select()
      .single()
    
    if (error) throw error
    return result
  }
}

// Simulação de transações (Supabase não tem transações como Prisma)
export const transaction = {
  async run<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    // Para operações simples, executamos diretamente
    // Em casos mais complexos, seria necessário implementar rollback manual
    const txObject = {
      user: userOperationsExtended,
      workspace: workspaceOperationsExtended,
      workspaceUser: workspaceUserOperations,
      platform: platformOperations,
      contact: contactOperations,
      conversation: conversationOperations,
      message: messageOperations,
      kanbanBoard: kanbanBoardOperationsExtended,
      kanbanColumn: kanbanColumnOperationsExtended,
      kanbanCard: kanbanOperations.card
    }
    
    return await callback(txObject)
  }
}

// Exportar operações estendidas para uso direto
export { workspaceOperationsExtended, kanbanBoardOperationsExtended, kanbanColumnOperationsExtended }
export const kanbanCardOperations = kanbanOperations.card

// Função utilitária para criar card no Kanban automaticamente
export async function createKanbanCardForConversation(conversationId: string, workspaceId: string) {
  try {
    // Buscar o board padrão do workspace
    const board = await kanbanBoardOperationsExtended.findByWorkspaceId(workspaceId)
    
    if (!board) {
      console.warn(`Board não encontrado para workspace ${workspaceId}`)
      return null
    }

    // Buscar a primeira coluna (coluna "Novo" ou primeira disponível)
    const { data: columns, error: columnsError } = await supabaseTyped
      .from('kanban_columns')
      .select('*')
      .eq('board_id', board.id)
      .order('position', { ascending: true })
      .limit(1)
    
    if (columnsError || !columns || columns.length === 0) {
      console.warn(`Nenhuma coluna encontrada para board ${board.id}`)
      return null
    }

    const firstColumn = columns[0]

    // Verificar se já existe um card para esta conversa
    const existingCard = await kanbanOperations.card.findFirst({
      conversation_id: conversationId
    })

    if (existingCard) {
      console.log(`Card já existe para conversa ${conversationId}`)
      return existingCard
    }

    // Buscar a próxima posição na coluna
    const { data: existingCards, error: cardsError } = await supabaseTyped
      .from('kanban_cards')
      .select('position')
      .eq('column_id', firstColumn.id)
      .order('position', { ascending: false })
      .limit(1)
    
    const nextPosition = (existingCards && existingCards.length > 0) 
      ? existingCards[0].position + 1 
      : 0

    // Criar o card
    const newCard = await kanbanOperations.card.create({
      position: nextPosition,
      column_id: firstColumn.id,
      conversation_id: conversationId
    })

    console.log(`Card criado automaticamente para conversa ${conversationId}`)
    return newCard
    
  } catch (error) {
    console.error('Erro ao criar card no Kanban:', error)
    return null
  }
}

// Exportar todas as operações em um objeto similar ao prisma
export const db = {
  user: userOperationsExtended,
  workspace: workspaceOperationsExtended,
  workspaceUser: workspaceUserOperations,
  platform: platformOperations,
  contact: contactOperations,
  conversation: conversationOperations,
  message: messageOperations,
  kanbanBoard: kanbanBoardOperationsExtended,
  kanbanColumn: kanbanColumnOperationsExtended,
  kanbanCard: kanbanOperations.card,
  $transaction: transaction.run
}