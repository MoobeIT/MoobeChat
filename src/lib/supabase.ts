import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para as tabelas do banco
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          role: 'USER' | 'ADMIN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          image?: string | null
          role?: 'USER' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          role?: 'USER' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspace_users: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          role: 'OWNER' | 'ADMIN' | 'MEMBER'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id: string
          role?: 'OWNER' | 'ADMIN' | 'MEMBER'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string
          role?: 'OWNER' | 'ADMIN' | 'MEMBER'
          created_at?: string
          updated_at?: string
        }
      }
      platforms: {
        Row: {
          id: string
          name: string
          type: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK'
          config: any
          workspace_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK'
          config?: any
          workspace_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK'
          config?: any
          workspace_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          platform_id: string
          workspace_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          platform_id: string
          workspace_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          platform_id?: string
          workspace_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          workspace_id: string
          platform_id: string
          external_id: string
          customer_name: string | null
          customer_phone: string | null
          customer_email: string | null
          status: 'OPEN' | 'CLOSED' | 'PENDING'
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          assigned_to: string | null
          tags: string[] | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          platform_id: string
          external_id: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_email?: string | null
          status?: 'OPEN' | 'CLOSED' | 'PENDING'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          assigned_to?: string | null
          tags?: string[] | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          platform_id?: string
          external_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_email?: string | null
          status?: 'OPEN' | 'CLOSED' | 'PENDING'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          assigned_to?: string | null
          tags?: string[] | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          external_id: string | null
          topic: string | null
          extension: string | null
          content: string
          message_type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT'
          payload: any | null
          direction: 'INCOMING' | 'OUTGOING'
          event: string | null
          sender_name: string | null
          private: boolean | null
          metadata: any | null
          created_at: string
          updated_at: string
          inserted_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          external_id?: string | null
          topic?: string | null
          extension?: string | null
          content: string
          message_type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT'
          payload?: any | null
          direction: 'INCOMING' | 'OUTGOING'
          event?: string | null
          sender_name?: string | null
          private?: boolean | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
          inserted_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          external_id?: string | null
          topic?: string | null
          extension?: string | null
          content?: string
          message_type?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT'
          payload?: any | null
          direction?: 'INCOMING' | 'OUTGOING'
          event?: string | null
          sender_name?: string | null
          private?: boolean | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
          inserted_at?: string
        }
      }
      kanban_boards: {
        Row: {
          id: string
          name: string
          workspace_id: string
          is_default: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          workspace_id: string
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          workspace_id?: string
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      kanban_columns: {
        Row: {
          id: string
          name: string
          position: number
          board_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          board_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          board_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      kanban_cards: {
        Row: {
          id: string
          title: string
          description: string | null
          position: number
          column_id: string
          conversation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          position?: number
          column_id: string
          conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          position?: number
          column_id?: string
          conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Cliente tipado
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey)