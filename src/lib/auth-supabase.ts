import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseTyped } from './supabase'

export const authOptionsSupabase: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Verificar se o usuário existe
          const { data: existingUser, error: userError } = await supabaseTyped
            .from('users')
            .select(`
              *,
              workspace_users(
                *,
                workspaces(*)
              )
            `)
            .eq('email', credentials.email)
            .single()

          let user = existingUser

          // Se o usuário não existe, criar um novo (registro automático)
          if (!user || userError) {
            // Criar usuário
            const { data: newUser, error: createUserError } = await supabaseTyped
              .from('users')
              .insert({
                email: credentials.email,
                name: credentials.email.split('@')[0], // Nome baseado no email
                role: 'USER'
              })
              .select()
              .single()

            if (createUserError || !newUser) {
              console.error('Erro ao criar usuário:', createUserError)
              return null
            }

            // Criar workspace padrão para o usuário
            const { data: workspace, error: workspaceError } = await supabaseTyped
              .from('workspaces')
              .insert({
                name: `Workspace de ${newUser.name}`,
                description: 'Workspace padrão'
              })
              .select()
              .single()

            if (workspaceError || !workspace) {
              console.error('Erro ao criar workspace:', workspaceError)
              return null
            }

            // Associar usuário ao workspace como OWNER
            const { error: workspaceUserError } = await supabaseTyped
              .from('workspace_users')
              .insert({
                user_id: newUser.id,
                workspace_id: workspace.id,
                role: 'OWNER'
              })

            if (workspaceUserError) {
              console.error('Erro ao associar usuário ao workspace:', workspaceUserError)
              return null
            }

            user = newUser
          }

          // Validação simples de senha (em produção, use hash)
          if (credentials.password === '123456' || credentials.password === 'admin') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role
            }
          }

          return null
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}

// Funções auxiliares para operações com usuários
export const userOperations = {
  // Buscar usuário por ID
  async findById(id: string) {
    const { data, error } = await supabaseTyped
      .from('users')
      .select(`
        *,
        workspace_users(
          *,
          workspaces(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar usuário:', error)
      return null
    }

    return data
  },

  // Buscar usuário por email
  async findByEmail(email: string) {
    const { data, error } = await supabaseTyped
      .from('users')
      .select(`
        *,
        workspace_users(
          *,
          workspaces(*)
        )
      `)
      .eq('email', email)
      .single()

    if (error) {
      // Se o erro for "não encontrado", retorna null (comportamento esperado)
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar usuário:', error)
      return null
    }

    return data
  },

  // Criar usuário
  async create(userData: { email: string; name?: string | null; password?: string; role?: 'USER' | 'ADMIN' }) {
    // Gerar ID único
    const userDataWithId = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const { data, error } = await supabaseTyped
      .from('users')
      .insert(userDataWithId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return null
    }

    return data
  },

  // Atualizar usuário
  async update(id: string, userData: Partial<{ name: string; email: string; role: 'USER' | 'ADMIN' }>) {
    const { data, error } = await supabaseTyped
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário:', error)
      return null
    }

    return data
  }
}

// Funções auxiliares para operações com workspaces
export const workspaceOperations = {
  // Buscar workspace por ID
  async findById(id: string) {
    const { data, error } = await supabaseTyped
      .from('workspaces')
      .select(`
        *,
        workspace_users(
          *,
          users(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar workspace:', error)
      return null
    }

    return data
  },

  // Criar workspace
  async create(workspaceData: { name: string; description?: string }) {
    const { data, error } = await supabaseTyped
      .from('workspaces')
      .insert(workspaceData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar workspace:', error)
      return null
    }

    return data
  },

  // Adicionar usuário ao workspace
  async addUser(workspaceId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER') {
    const { data, error } = await supabaseTyped
      .from('workspace_users')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        role
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao adicionar usuário ao workspace:', error)
      return null
    }

    return data
  }
}