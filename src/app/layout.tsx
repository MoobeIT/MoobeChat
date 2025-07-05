import './globals.css'
import { Providers } from '@/components/providers'

export const metadata = {
  title: 'Moobi Chat - Central de Comunicação',
  description: 'Plataforma SAAS para gerenciamento de conversas em múltiplas plataformas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 