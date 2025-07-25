import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptionsSupabase } from '@/lib/auth-supabase'
import { platformOperations, messageOperations } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsSupabase)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { platformId, phone, message, senderName } = await request.json()

    if (!platformId || !phone || !message) {
      return NextResponse.json({ 
        error: 'platformId, phone e message são obrigatórios' 
      }, { status: 400 })
    }

    // Buscar plataforma
    const platform = await platformOperations.findById(platformId)

    if (!platform) {
      return NextResponse.json({ error: 'Plataforma não encontrada' }, { status: 404 })
    }

    const config = platform.config as any
    const instanceName = config?.instanceName || config?.instanceId

    if (!instanceName) {
      return NextResponse.json({ error: 'Nome da instância não encontrado' }, { status: 400 })
    }

    console.log('🧪 TESTE FORÇADO - Criando mensagem simulada')
    console.log(`  📱 Plataforma: ${platform.name} (${platform.id})`)
    console.log(`  📞 Telefone: ${phone}`)
    console.log(`  💬 Mensagem: ${message}`)
    console.log(`  👤 Remetente: ${senderName}`)

    // Simular payload do webhook UazAPI
    const webhookPayload = {
      event: 'messages.upsert',
      instance: instanceName,
      instanceId: instanceName,
      data: {
        messages: [{
          key: {
            id: `FORCE_TEST_${Date.now()}`,
            remoteJid: `${phone}@s.whatsapp.net`,
            fromMe: false
          },
          message: {
            conversation: message
          },
          messageTimestamp: Math.floor(Date.now() / 1000),
          pushName: senderName || 'Teste Forçado'
        }]
      }
    }

    console.log('🔄 Enviando para webhook interno...')

    // Enviar diretamente para o webhook
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

    // Verificar se a mensagem foi criada (buscar por conteúdo manualmente)
    const allMessages = await messageOperations.findMany({ conversation_id: null })
    const createdMessage = allMessages.find(msg => 
      msg.content === message && 
      msg.conversation?.platform_id === platformId
    )

    return NextResponse.json({
      success: true,
      message: 'Teste forçado executado!',
      details: {
        platform: platform.name,
        instanceName,
        phone,
        messageContent: message,
        senderName: senderName || 'Teste Forçado',
        webhookResult,
        messageCreated: !!createdMessage,
        conversationId: createdMessage?.conversation?.id
      }
    })

  } catch (error) {
    console.error('❌ Erro no teste forçado:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}