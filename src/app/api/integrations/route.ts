import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureUserWorkspace } from '@/lib/workspace'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id,
      session.user.email || undefined,
      session.user.name || undefined
    )

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

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id,
      session.user.email || undefined,
      session.user.name || undefined
    )

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