import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceName, phone, message, senderName } = await request.json()

    if (!instanceName || !phone || !message) {
      return NextResponse.json({ 
        error: 'instanceName, phone e message são obrigatórios' 
      }, { status: 400 })
    }

    console.log('🧪 Teste de webhook simples recebido:')
    console.log(`  📱 Instância: ${instanceName}`)
    console.log(`  📞 Telefone: ${phone}`)
    console.log(`  👤 Remetente: ${senderName || 'Não informado'}`)
    console.log(`  💬 Mensagem: ${message}`)

    // Simular o webhook real
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
          pushName: senderName || 'Teste'
        }]
      }
    }

    console.log('🔄 Enviando para webhook interno...')

    // Enviar para o webhook interno
    const webhookResponse = await fetch(`${process.env.WEBHOOK_URL || 'http://localhost:3000'}/api/webhooks/uazapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    })

    const webhookResult = await webhookResponse.json()

    console.log('✅ Resposta do webhook:', webhookResult)

    return NextResponse.json({
      success: true,
      message: 'Teste de webhook executado com sucesso',
      webhook: {
        payload: webhookPayload,
        response: webhookResult,
        status: webhookResponse.status
      },
      instructions: {
        nextStep: 'Verifique se a mensagem apareceu na aba "Conversas"',
        tip: 'Se não apareceu, verifique se existe uma plataforma conectada com o nome da instância'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de webhook:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para testar webhook',
    usage: 'POST com { instanceName, phone, message, senderName }',
    example: {
      instanceName: 'minha-instancia',
      phone: '5511999999999',
      message: 'Olá! Esta é uma mensagem de teste.',
      senderName: 'João Silva'
    },
    instructions: [
      '1. Conecte uma plataforma WhatsApp primeiro',
      '2. Use o POST neste endpoint com os dados de exemplo',
      '3. Verifique se a mensagem aparece na aba "Conversas"'
    ]
  })
} 