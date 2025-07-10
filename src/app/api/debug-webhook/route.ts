import { NextRequest, NextResponse } from 'next/server'

// Armazenar os últimos webhooks recebidos em memória para debug
let recentWebhooks: any[] = []

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Debug do webhook ativo',
    recentWebhooks: recentWebhooks.slice(-10), // Últimos 10 webhooks
    count: recentWebhooks.length,
    instructions: 'Este endpoint mostra os últimos webhooks recebidos para debug'
  })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Adicionar timestamp e salvar webhook para debug
    const webhookData = {
      timestamp: new Date().toISOString(),
      payload,
      headers: Object.fromEntries(request.headers.entries())
    }
    
    recentWebhooks.push(webhookData)
    
    // Manter apenas os últimos 20 webhooks
    if (recentWebhooks.length > 20) {
      recentWebhooks = recentWebhooks.slice(-20)
    }
    
    console.log('🔔 DEBUG WEBHOOK - Dados recebidos:', JSON.stringify(webhookData, null, 2))
    
    return NextResponse.json({ 
      received: true, 
      status: 'debug', 
      timestamp: webhookData.timestamp,
      message: 'Webhook recebido e salvo para debug'
    })
    
  } catch (error) {
    console.error('❌ Erro no debug webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 