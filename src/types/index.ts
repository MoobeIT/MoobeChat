// Tipos básicos para o projeto (sem dependência do Prisma por enquanto)
export type PlatformType = 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL'
export type ConversationStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER' | 'LOCATION'
export type Direction = 'INCOMING' | 'OUTGOING'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Platform {
  id: string
  workspaceId: string
  type: PlatformType
  name: string
  config: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  workspaceId: string
  platformId: string
  externalId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  status: ConversationStatus
  priority: Priority
  assignedTo?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastMessageAt?: Date
}

export interface Message {
  id: string
  conversationId: string
  externalId?: string
  content: string
  messageType: MessageType
  direction: Direction
  senderName?: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export interface KanbanBoard {
  id: string
  workspaceId: string
  name: string
  description?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface KanbanColumn {
  id: string
  boardId: string
  name: string
  color?: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface KanbanCard {
  id: string
  columnId: string
  conversationId: string
  position: number
  createdAt: Date
  updatedAt: Date
}

// Tipos estendidos com relacionamentos
export type ConversationWithMessages = Conversation & {
  messages: Message[]
  platform: Platform
}

export type ConversationWithCard = Conversation & {
  platform: Platform
  kanbanCard?: KanbanCard & {
    column: KanbanColumn
  }
  _count: {
    messages: number
  }
}

export type KanbanBoardWithColumns = KanbanBoard & {
  columns: (KanbanColumn & {
    cards: (KanbanCard & {
      conversation: ConversationWithCard
    })[]
  })[]
}

export type WorkspaceWithUsers = Workspace & {
  users: {
    user: User
    role: string
  }[]
}

// Tipos para API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  text?: {
    body: string
  }
  type: 'text' | 'image' | 'document' | 'audio' | 'video'
}

export interface InstagramMessage {
  id: string
  from: {
    id: string
    username: string
  }
  created_time: string
  message: string
}

// Tipos para Kanban
export interface DragResult {
  destination: {
    droppableId: string
    index: number
  } | null
  source: {
    droppableId: string
    index: number
  }
  draggableId: string
}

// Tipos já exportados acima 