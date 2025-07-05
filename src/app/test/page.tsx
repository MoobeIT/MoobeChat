export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>🚀 Moobi Chat - Teste</h1>
      <p>Se você está vendo esta página, o Next.js está funcionando!</p>
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>✅ Status do Projeto:</h2>
        <ul>
          <li>✅ Next.js 14 configurado</li>
          <li>✅ TypeScript funcionando</li>
          <li>✅ Tailwind CSS instalado</li>
          <li>✅ Estrutura do projeto criada</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/dashboard" 
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block'
          }}
        >
          Ir para o Dashboard
        </a>
      </div>
    </div>
  )
} 