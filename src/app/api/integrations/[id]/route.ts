import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { platformOperations } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const platform = await platformOperations.findById((await params).id)

    if (!platform) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ platform })
    
  } catch (error) {
    console.error('Erro ao buscar integração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { name, config, isActive } = await request.json()

    const platform = await platformOperations.findById((await params).id)

    if (!platform) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 })
    }

    const updatedPlatform = await platformOperations.update({ id: (await params).id }, {
      ...(name && { name }),
      ...(config && { config }),
      ...(isActive !== undefined && { isActive })
    })

    return NextResponse.json({ platform: updatedPlatform })
    
  } catch (error) {
    console.error('Erro ao atualizar integração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const platform = await platformOperations.findById((await params).id)

    if (!platform) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 })
    }

    await platformOperations.delete({ id: (await params).id })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Erro ao deletar integração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}