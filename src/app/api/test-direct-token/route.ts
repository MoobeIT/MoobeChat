import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const UAZAPI_URL = process.env.UAZAPI_URL || 'https://free.uazapi.com'

export async function POST(request: NextRequest) {
  try {
    const { token, phone, message } = await request.json()

    if (!token || !phone || !message) {
      return NextResponse.json({ 
        error: 'token, phone e message são obrigatórios' 
      }, { status: 400 })
    }

    console.log(`🧪 Testando com token direto: ${token}`)
    console.log(`📱 Enviando para: ${phone}`)
    console.log(`💬 Mensagem: ${message}`)

    // Primeiro, verificar status da instância
    try {
      console.log('🔍 Verificando status da instância...')
      const statusResponse = await axios.get(`${UAZAPI_URL}/instance/status`, {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ Status obtido:', statusResponse.data)
      
      if (statusResponse.data.instance?.status !== 'connected') {
        return NextResponse.json({
          success: false,
          error: 'Instância não está conectada',
          status: statusResponse.data.instance?.status || 'unknown',
          instanceData: statusResponse.data
        })
      }
      
    } catch (statusError: any) {
      console.error('❌ Erro ao verificar status:', statusError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar status da instância',
        details: statusError.response?.data || statusError.message
      })
    }

    // Agora tentar enviar mensagem com formato simples
    const formattedPhone = phone.replace(/\D/g, '').startsWith('55') ? phone.replace(/\D/g, '') : `55${phone.replace(/\D/g, '')}`
    
    const payload = {
      phone: formattedPhone,
      message: message
    }

    console.log('📦 Enviando com payload:', payload)

    const response = await axios.post(`${UAZAPI_URL}/send/text`, payload, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ Mensagem enviada com sucesso:', response.data)

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      data: response.data,
      payload: payload
    })

  } catch (error: any) {
    console.error('❌ Erro no teste direto:', error)
    
    const errorData = error.response?.data || error.message
    const status = error.response?.status || 500

    return NextResponse.json({
      success: false,
      error: 'Erro ao enviar mensagem',
      details: errorData,
      status: status
    }, { status: 500 })
  }
} 