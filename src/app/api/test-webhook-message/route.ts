import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceName, phone, message, senderName } = await request.json()

    if (!instanceName || !phone || !message) {
      return NextResponse.json({ 
        error: 'instanceName, phone e message são obrigatórios' 
      }, { status: 400 })
    }

    console.log('🧪 Teste de webhook - Simulando mensagem recebida:')
    console.log(`  📱 Instância: ${instanceName}`)
    console.log(`  📞 Telefone: ${phone}`)
    console.log(`  👤 Remetente: ${senderName || 'Cliente de Teste'}`)
    console.log(`  💬 Mensagem: ${message}`)

    // Simular o webhook real da UazAPI
    const webhookPayload = {
      event: 'messages.upsert',
      instance: instanceName,
      data: {
        messages: [{
          key: {
            id: `TEST_${Date.now()}`,
            remoteJid: `${phone}@s.whatsapp.net`,
            fromMe: false
          },
          message: {
            conversation: message
          },
          messageTimestamp: Math.floor(Date.now() / 1000),
          pushName: senderName || 'Cliente de Teste'
        }]
      }
    }

    console.log('🔄 Enviando para webhook interno...')

    // Enviar para o webhook interno
    const webhookUrl = `${process.env.WEBHOOK_URL || 'http://localhost:3000'}/api/webhooks/uazapi`
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    })

    const webhookResult = await webhookResponse.json()

    console.log('✅ Resposta do webhook:', webhookResult)

    if (webhookResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Teste de webhook realizado com sucesso!',
        details: {
          webhookUrl,
          instanceName,
          phone,
          message,
          senderName: senderName || 'Cliente de Teste',
          webhookResult
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Erro ao processar webhook',
        details: {
          webhookUrl,
          status: webhookResponse.status,
          webhookResult
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro no teste de webhook:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Endpoint de teste do webhook',
    usage: 'POST com { instanceName, phone, message, senderName }',
    example: {
      instanceName: 'minha-instancia',
      phone: '5511999999999',
      message: 'Olá! Esta é uma mensagem de teste.',
      senderName: 'João Silva'
    }
  })
}