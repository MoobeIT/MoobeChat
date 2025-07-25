import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CREDENTIALS, authenticateMockUser } from '@/lib/mock-credentials'

export async function GET() {
  if (process.env.MOCK_DATA_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Endpoint apenas para desenvolvimento' }, { status: 403 })
  }

  const users = MOCK_CREDENTIALS.users.map((user: any) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }))

  return NextResponse.json({
    message: 'Credenciais de teste disponíveis',
    users,
    environment: {
      MOCK_DATA_ENABLED: process.env.MOCK_DATA_ENABLED,
      NODE_ENV: process.env.NODE_ENV
    }
  })
}

export async function POST(request: NextRequest) {
  if (process.env.MOCK_DATA_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Endpoint apenas para desenvolvimento' }, { status: 403 })
  }

  const { email, password } = await request.json()
  
  const user = authenticateMockUser(email, password)
  
  if (user) {
    return NextResponse.json({
      success: true,
      message: 'Credenciais válidas',
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role
      }
    })
  }

  return NextResponse.json({
    success: false,
    message: 'Credenciais inválidas'
  }, { status: 401 })
}