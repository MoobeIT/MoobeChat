import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { contactOperations, platformOperations } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const platformId = searchParams.get('platformId')

    const contacts = await contactOperations.findMany({
      workspace_id: session.user.workspaceId,
      search,
      platformId
    })

    return NextResponse.json({ contacts })
    
  } catch (error) {
    console.error('Erro ao buscar contatos:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, phone, email, notes, tags, platformId } = await request.json()

    if (!name || !phone || !platformId) {
      return NextResponse.json({ error: 'Nome, telefone e plataforma são obrigatórios' }, { status: 400 })
    }

    const platform = await platformOperations.findById(platformId)

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    const existingContact = await contactOperations.findByPhone(phone, platform.workspace_id)

    if (existingContact) {
      return NextResponse.json({ error: 'Contato já existe para esta plataforma' }, { status: 409 })
    }

    const contact = await contactOperations.create({
      workspace_id: platform.workspace_id,
      platformId: platformId,
      name,
      phone,
      email: email || null,
      notes: notes || null,
      tags: tags || []
    })

    return NextResponse.json({ contact })
    
  } catch (error) {
    console.error('Erro ao criar contato:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}