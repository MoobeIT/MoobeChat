import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
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

        try {
          // Verificar se o usuário existe
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              workspaces: {
                include: {
                  workspace: true
                }
              }
            }
          })

          // Se o usuário não existe, criar um novo (registro automático)
          if (!user) {
            // Criar usuário
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0], // Nome baseado no email
                role: 'USER'
              },
              include: {
                workspaces: {
                  include: {
                    workspace: true
                  }
                }
              }
            })

            // Criar workspace padrão para o usuário
            const workspace = await prisma.workspace.create({
              data: {
                name: `Workspace de ${user.name}`,
                description: 'Workspace padrão'
              }
            })

            // Associar usuário ao workspace como OWNER
            await prisma.workspaceUser.create({
              data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'OWNER'
              }
            })

            // Recarregar usuário com workspace
            user = await prisma.user.findUnique({
              where: { id: user.id },
              include: {
                workspaces: {
                  include: {
                    workspace: true
                  }
                }
              }
            })
          }

          // Validação simples de senha (em produção, use hash)
          if (credentials.password === '123456' || credentials.password === 'admin') {
            return {
              id: user!.id,
              email: user!.email,
              name: user!.name,
              image: user!.image,
              role: user!.role
            }
          }

          return null
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
} 