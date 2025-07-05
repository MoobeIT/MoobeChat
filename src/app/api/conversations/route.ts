import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')

    // Buscar workspace do usuário (por simplicidade, pegar o primeiro)
    const workspace = await prisma.workspace.findFirst({
      where: {
        users: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!workspace) {
      return NextResponse.json({ conversations: [] })
    }

    const whereClause: any = {
      workspaceId: workspace.id
    }

    if (status) {
      whereClause.status = status
    }

    if (platform) {
      whereClause.platform = {
        type: platform
      }
    }

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } }
      ]
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        platform: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    return NextResponse.json({ conversations })
    
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { platformId, customerName, customerPhone, customerEmail } = await request.json()

    // Verificar se a plataforma pertence ao workspace do usuário
    const platform = await prisma.platform.findFirst({
      where: {
        id: platformId,
        workspace: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    // Criar conversa
    const conversation = await prisma.conversation.create({
      data: {
        workspaceId: platform.workspaceId,
        platformId: platform.id,
        externalId: customerPhone, // Usar telefone como ID externo
        customerName,
        customerPhone,
        customerEmail,
        status: 'OPEN',
        priority: 'MEDIUM'
      },
      include: {
        platform: true,
        messages: true
      }
    })

    return NextResponse.json({ conversation })
    
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 