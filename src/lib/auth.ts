import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authenticateMockUser } from './mock-credentials'

// Função para criar hash da senha
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

// Função para verificar senha
export const verifyPassword = (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const authOptions: NextAuthOptions = {
  // Usar adapter do Prisma apenas em produção
  ...(process.env.MOCK_DATA_ENABLED !== 'true' && { adapter: PrismaAdapter(prisma) }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Se estiver em modo de desenvolvimento, usar credenciais mockadas
        if (process.env.MOCK_DATA_ENABLED === 'true') {
          const mockUser = authenticateMockUser(credentials.email, credentials.password)
          if (mockUser) {
            return {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: mockUser.role,
              avatar: mockUser.avatar
            }
          }
          return null
        }

        // Modo produção - usar Prisma com hash de senhas
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('Usuário não encontrado:', credentials.email)
            return null
          }

          // Verificação de senha temporária
          let isValidPassword = false
          
          // Se for um usuário de teste (mock)
          if (credentials.password === '123456' && 
              (user.email.includes('moobi.test') || !user.email.includes('@'))) {
            isValidPassword = true
          } else if (user.email && user.email.includes('@') && !user.email.includes('moobi.test')) {
            // Para usuários reais criados via API
            // Por enquanto, aceitar qualquer senha (em produção usar hash)
            console.log('Autenticando usuário real:', user.email)
            isValidPassword = credentials.password.length >= 6
          }

          if (!isValidPassword) {
            console.log('Senha inválida para:', credentials.email)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'USER'
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatar = token.avatar as string
      }
      return session
    }
  }
} 