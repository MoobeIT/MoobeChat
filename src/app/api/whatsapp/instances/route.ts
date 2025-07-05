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

    // Buscar workspace do usuário
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
      return NextResponse.json({ instances: [] })
    }

    // Buscar plataformas WhatsApp do workspace
    const platforms = await prisma.platform.findMany({
      where: {
        workspaceId: workspace.id,
        type: 'WHATSAPP'
      }
    })

    return NextResponse.json({ instances: platforms })
    
  } catch (error) {
    console.error('Erro ao buscar instâncias:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { instanceName } = await request.json()

    if (!instanceName) {
      return NextResponse.json({ error: 'Nome da instância é obrigatório' }, { status: 400 })
    }

    // Buscar workspace do usuário
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
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Criar plataforma no banco
    const platform = await prisma.platform.create({
      data: {
        workspaceId: workspace.id,
        type: 'WHATSAPP',
        name: instanceName,
        config: { instanceName },
        isActive: true
      }
    })

    return NextResponse.json({ instance: platform })
    
  } catch (error) {
    console.error('Erro ao criar instância:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 