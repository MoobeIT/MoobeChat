import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'

const UAZAPI_BASE_URL = process.env.UAZAPI_BASE_URL || 'https://free.uazapi.com'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { token, phone, message } = await request.json()

    if (!token || !phone || !message) {
      return NextResponse.json({ 
        error: 'Token, telefone e mensagem são obrigatórios' 
      }, { status: 400 })
    }

    console.log(`🔑 Testando token: ${token.slice(0, 10)}...`)
    console.log(`📱 Testando envio para: ${phone}`)
    console.log(`💬 Mensagem: ${message.slice(0, 50)}...`)

    // Formatar telefone
    const formattedPhone = phone.replace(/\D/g, '').startsWith('55') ? 
      phone.replace(/\D/g, '') : 
      `55${phone.replace(/\D/g, '')}`

    // Formatos diferentes para testar
    const testFormats = [
      {
        name: "phone + text (mais comum)",
        payload: {
          phone: formattedPhone,
          text: message
        }
      },
      {
        name: "phone + text + type",
        payload: {
          phone: formattedPhone,
          text: message,
          type: "text"
        }
      },
      {
        name: "phone + message (atual)",
        payload: {
          phone: formattedPhone,
          message: message
        }
      },
      {
        name: "phone + body",
        payload: {
          phone: formattedPhone,
          body: message
        }
      },
      {
        name: "number + text",
        payload: {
          number: formattedPhone,
          text: message
        }
      },
      {
        name: "to + text",
        payload: {
          to: formattedPhone,
          text: message
        }
      },
      {
        name: "phone + text + delay",
        payload: {
          phone: formattedPhone,
          text: message,
          delay: 1000
        }
      }
    ]

    const results = []

    for (let i = 0; i < testFormats.length; i++) {
      const testFormat = testFormats[i]
      
      try {
        console.log(`🧪 Testando formato: ${testFormat.name}`)
        console.log(`📋 Payload:`, testFormat.payload)

        const response = await fetch(`${UAZAPI_BASE_URL}/send/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify(testFormat.payload)
        })

        const data = await response.json()

        if (response.ok) {
          console.log(`✅ Formato "${testFormat.name}" FUNCIONOU!`)
          results.push({
            format: testFormat.name,
            payload: testFormat.payload,
            status: 'success',
            statusCode: response.status,
            response: data,
            success: true
          })
          
          // Se funcionou, podemos parar aqui
          break
        } else {
          console.log(`❌ Formato "${testFormat.name}" falhou: ${response.status}`)
          results.push({
            format: testFormat.name,
            payload: testFormat.payload,
            status: 'failed',
            statusCode: response.status,
            response: data,
            success: false
          })
        }

      } catch (error) {
        console.log(`❌ Formato "${testFormat.name}" erro:`, error)
        results.push({
          format: testFormat.name,
          payload: testFormat.payload,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          success: false
        })
      }
    }

    // Encontrar o formato que funcionou
    const successfulFormat = results.find(r => r.success)

    return NextResponse.json({
      success: !!successfulFormat,
      phone: formattedPhone,
      message,
      successfulFormat: successfulFormat || null,
      allResults: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })

  } catch (error) {
    console.error('❌ Erro no teste de formatos:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}