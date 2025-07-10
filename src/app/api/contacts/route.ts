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

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const platformId = searchParams.get('platformId')

    // Garantir que o workspace do usuário existe
    const workspace = await ensureUserWorkspace(
      session.user.id,
      session.user.email || undefined,
      session.user.name || undefined
    )

    const whereClause: any = {
      workspaceId: workspace.id
    }

    if (platformId) {
      whereClause.platformId = platformId
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ contacts })
    
  } catch (error) {
    console.error('Erro ao buscar contatos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, phone, email, notes, tags, platformId } = await request.json()

    if (!name || !phone || !platformId) {
      return NextResponse.json({ error: 'Nome, telefone e plataforma são obrigatórios' }, { status: 400 })
    }

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

    // Verificar se o contato já existe
    const existingContact = await prisma.contact.findFirst({
      where: {
        workspaceId: platform.workspaceId,
        platformId: platformId,
        phone: phone
      }
    })

    if (existingContact) {
      return NextResponse.json({ error: 'Contato já existe para esta plataforma' }, { status: 409 })
    }

    const contact = await prisma.contact.create({
      data: {
        workspaceId: platform.workspaceId,
        platformId: platformId,
        name,
        phone,
        email: email || null,
        notes: notes || null,
        tags: tags || []
      },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({ contact })
    
  } catch (error) {
    console.error('Erro ao criar contato:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 