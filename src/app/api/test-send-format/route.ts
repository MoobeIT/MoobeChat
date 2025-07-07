import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const UAZAPI_URL = process.env.UAZAPI_URL || 'https://free.uazapi.com'
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { instanceToken, phone, message } = await request.json()

    if (!instanceToken || !phone || !message) {
      return NextResponse.json({ 
        error: 'instanceToken, phone e message são obrigatórios' 
      }, { status: 400 })
    }

    console.log(`🔑 Token recebido: ${instanceToken}`)
    console.log(`📱 Testando envio para: ${phone}`)
    console.log(`💬 Mensagem: ${message.substring(0, 50)}...`)

    const formattedPhone = phone.replace(/\D/g, '').startsWith('55') ? phone.replace(/\D/g, '') : `55${phone.replace(/\D/g, '')}`

    // Testar formatos básicos para encontrar o correto
    const testFormats = [
      {
        name: 'Formato 1: phone + message',
        payload: {
          phone: formattedPhone,
          message: message
        }
      },
      {
        name: 'Formato 2: phone + text',
        payload: {
          phone: formattedPhone,
          text: message
        }
      },
      {
        name: 'Formato 3: phone + body',
        payload: {
          phone: formattedPhone,
          body: message
        }
      }
    ]

    const results = []

    for (const format of testFormats) {
              try {
          console.log(`🧪 Testando ${format.name}:`, format.payload)
          
          const response = await axios.post(`${UAZAPI_URL}/send/text`, format.payload, {
          headers: {
            'token': instanceToken,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        })

        console.log(`✅ ${format.name} funcionou:`, response.data)
        
        results.push({
          format: format.name,
          payload: format.payload,
          success: true,
          response: response.data,
          status: response.status
        })

        // Se um formato funcionou, parar aqui
        break

      } catch (error: any) {
        console.log(`❌ ${format.name} falhou:`, error.response?.data || error.message)
        
        results.push({
          format: format.name,
          payload: format.payload,
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        })
      }
    }

    return NextResponse.json({
      success: true,
      testResults: results,
      summary: `Testados ${results.length} formatos. Sucessos: ${results.filter(r => r.success).length}`
    })

  } catch (error) {
    console.error('❌ Erro no teste de formatos:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 