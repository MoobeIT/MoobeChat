import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { userOperations, db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    console.log('🔍 Session completa:', JSON.stringify(session, null, 2))

    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Não autorizado',
        session: session 
      }, { status: 401 })
    }

    // Verificar se o usuário existe na tabela users
    const userInDb = await userOperations.findById(session.user.id)

    // Verificar se existe pelo email
    const userByEmail = session.user.email ? await userOperations.findByEmail(session.user.email) : null

    // Listar todos os usuários para debug
    const allUsers = await db.user.findMany()

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