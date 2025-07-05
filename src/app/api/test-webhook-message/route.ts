import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Dados de exemplo de uma mensagem recebida via webhook
    const testWebhookData = {
      event: 'messages.upsert',
      instance: 'moobi_cmcqrh1q_1751751263919',
      data: {
        messages: [{
          key: {
            id: 'TEST_MESSAGE_' + Date.now(),
            remoteJid: '5511999999999@s.whatsapp.net',
            fromMe: false
          },
          message: {
            conversation: 'Esta é uma mensagem de teste do webhook!'
          },
          messageTimestamp: Math.floor(Date.now() / 1000),
          pushName: 'Teste Usuario'
        }]
      }
    }

    console.log('🧪 Enviando mensagem de teste para webhook...')
    console.log('📨 Dados:', JSON.stringify(testWebhookData, null, 2))

    // Enviar para o webhook
    const webhookResponse = await fetch(`${process.env.WEBHOOK_URL}/api/webhooks/uazapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testWebhookData)
    })

    const webhookResult = await webhookResponse.json()

    console.log('✅ Resposta do webhook:', webhookResult)

    return NextResponse.json({
      success: true,
      message: 'Mensagem de teste enviada para webhook',
      webhookResponse: webhookResult,
      testData: testWebhookData
    })

  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para testar webhook com mensagem de exemplo',
    usage: 'POST para enviar mensagem de teste'
  })
} 