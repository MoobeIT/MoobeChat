import { NextRequest, NextResponse } from 'next/server'

// Capturar webhooks reais para análise
let capturedWebhooks: any[] = []

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Capturador de webhooks ativo',
    captured: capturedWebhooks.slice(-5), // Últimos 5 webhooks
    count: capturedWebhooks.length,
    analysis: capturedWebhooks.length > 0 ? analyzeWebhooks() : null
  })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const headers = Object.fromEntries(request.headers.entries())
    
    // Capturar dados completos
    const webhookData = {
      timestamp: new Date().toISOString(),
      payload,
      headers,
      url: request.url,
      method: request.method
    }
    
    capturedWebhooks.push(webhookData)
    
    // Manter apenas os últimos 50
    if (capturedWebhooks.length > 50) {
      capturedWebhooks = capturedWebhooks.slice(-50)
    }
    
    console.log('🎯 WEBHOOK CAPTURADO:', JSON.stringify(webhookData, null, 2))
    
    // Análise automática do formato
    const analysis = {
      hasEvent: !!payload.event,
      hasInstance: !!(payload.instance || payload.instanceName || payload.instanceId),
      hasData: !!payload.data,
      hasMessages: !!(payload.data?.messages || payload.messages),
      eventType: payload.event,
      instanceField: payload.instance || payload.instanceName || payload.instanceId,
      structure: Object.keys(payload),
      dataStructure: payload.data ? Object.keys(payload.data) : null,
      messageStructure: payload.data?.messages?.[0] ? Object.keys(payload.data.messages[0]) : null
    }
    
    console.log('📊 ANÁLISE DO WEBHOOK:', analysis)
    
    return NextResponse.json({ 
      received: true, 
      timestamp: webhookData.timestamp,
      analysis,
      message: 'Webhook capturado para análise'
    })
    
  } catch (error) {
    console.error('❌ Erro ao capturar webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

function analyzeWebhooks() {
  if (capturedWebhooks.length === 0) return null
  
  const events = capturedWebhooks.map(w => w.payload?.event).filter(Boolean)
  const instances = capturedWebhooks.map(w => 
    w.payload?.instance || w.payload?.instanceName || w.payload?.instanceId
  ).filter(Boolean)
  
  const structures = capturedWebhooks.map(w => ({
    timestamp: w.timestamp,
    event: w.payload?.event,
    hasData: !!w.payload?.data,
    hasMessages: !!(w.payload?.data?.messages || w.payload?.messages),
    keys: Object.keys(w.payload || {}),
    dataKeys: w.payload?.data ? Object.keys(w.payload.data) : null
  }))
  
  return {
    totalWebhooks: capturedWebhooks.length,
    uniqueEvents: Array.from(new Set(events)),
    uniqueInstances: Array.from(new Set(instances)),
    structures,
    commonStructure: findCommonStructure(capturedWebhooks)
  }
}

function findCommonStructure(webhooks: any[]) {
  if (webhooks.length === 0) return null
  
  const allKeys = webhooks.map(w => Object.keys(w.payload || {}))
  const commonKeys = allKeys.reduce((common, keys) => 
    common.filter(key => keys.includes(key))
  )
  
  return {
    commonTopLevelKeys: commonKeys,
    samplePayload: webhooks[webhooks.length - 1]?.payload
  }
} 