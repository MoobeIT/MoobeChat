import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { contactOperations, platformOperations } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contactId = (await params).id

    const contact = await contactOperations.findById(contactId)

    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ contact })
    
  } catch (error) {
    console.error('Erro ao buscar contato:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contactId = (await params).id
    const { name, phone, email, notes, tags, platformId } = await request.json()

    if (!name || !phone || !platformId) {
      return NextResponse.json({ error: 'Nome, telefone e plataforma são obrigatórios' }, { status: 400 })
    }

    // Verificar se o contato pertence ao workspace do usuário
    const existingContact = await contactOperations.findById(contactId)

    if (!existingContact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    // Verificar se a plataforma pertence ao workspace do usuário
    const platform = await platformOperations.findById(platformId)

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    // Verificar se já existe outro contato com o mesmo telefone na mesma plataforma
    const duplicateContact = await contactOperations.findByPhoneExcluding(phone, platform.workspace_id, contactId)

    if (duplicateContact) {
      return NextResponse.json({ error: 'Já existe outro contato com este telefone nesta plataforma' }, { status: 409 })
    }

    const contact = await contactOperations.update(contactId, {
      name,
      phone,
      email: email || null,
      notes: notes || null,
      tags: tags || [],
      platformId: platformId
    })

    return NextResponse.json({ contact })
    
  } catch (error) {
    console.error('Erro ao atualizar contato:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const contactId = (await params).id

    // Verificar se o contato pertence ao workspace do usuário
    const contact = await contactOperations.findById(contactId)

    if (!contact) {
      return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 })
    }

    await contactOperations.delete(contactId)

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao deletar contato:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}