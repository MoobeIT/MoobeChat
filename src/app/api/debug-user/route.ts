import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Session completa:', JSON.stringify(session, null, 2))

    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Não autorizado',
        session: session 
      }, { status: 401 })
    }

    // Verificar se o usuário existe na tabela users
    const userInDb = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        }
      }
    })

    // Verificar se existe pelo email
    const userByEmail = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        }
      }
    })

    // Listar todos os usuários para debug
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      session: {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name
      },
      userInDb: userInDb,
      userByEmail: userByEmail,
      allUsers: allUsers,
      debug: {
        userExistsById: !!userInDb,
        userExistsByEmail: !!userByEmail,
        totalUsers: allUsers.length
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 