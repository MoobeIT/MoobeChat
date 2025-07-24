import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { platformOperations } from '@/lib/database'
import { ensureUserWorkspace } from '@/lib/workspace'
import { randomUUID } from 'crypto'

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
    const platforms = await platformOperations.findMany({
      workspace_id: workspace.id
    })

    // Filtrar apenas plataformas ativas
    const activePlatforms = platforms.filter(p => p.is_active)

    return NextResponse.json({ platforms: activePlatforms })
    
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

    // Verificar se já existe uma plataforma com esse nome no workspace
    const allPlatforms = await platformOperations.findMany({
      workspace_id: workspace.id
    })
    
    const existingPlatform = allPlatforms.find(p => p.name === name)

    if (existingPlatform) {
      return NextResponse.json({ 
        error: 'Já existe uma plataforma com este nome' 
      }, { status: 409 })
    }

    // Criar nova integração
    const platform = await platformOperations.create({
      id: randomUUID(),
      workspace_id: workspace.id,
      type: type.toUpperCase(),
      name,
      config: config || {},
      is_active: true
    })

    return NextResponse.json({ platform })
    
  } catch (error) {
    console.error('Erro ao criar integração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}