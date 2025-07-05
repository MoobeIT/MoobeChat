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
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    // Buscar todas as plataformas/integrações
    const platforms = await prisma.platform.findMany({
      where: {
        workspaceId: workspace.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ platforms })
    
  } catch (error) {
    console.error('Erro ao buscar integrações:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { type, name, config } = await request.json()

    // Validar dados
    if (!type || !name) {
      return NextResponse.json({ error: 'Tipo e nome são obrigatórios' }, { status: 400 })
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

    // Criar nova integração
    const platform = await prisma.platform.create({
      data: {
        workspaceId: workspace.id,
        type: type.toUpperCase(),
        name,
        config: config || {},
        isActive: true
      }
    })

    return NextResponse.json({ platform })
    
  } catch (error) {
    console.error('Erro ao criar integração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 