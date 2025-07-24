# 🛠️ Scripts Utilitários

> **Organizado em:** 18 de Julho de 2025

Scripts para automação, configuração e manutenção do projeto Moobi Chat.

## 📁 Estrutura dos Scripts

### 🗄️ [Database](database/)
Scripts relacionados ao banco de dados:

- **[supabase-schema.sql](database/supabase-schema.sql)** - Schema completo do banco
- **[supabase-schema-step-by-step.sql](database/supabase-schema-step-by-step.sql)** - Schema em etapas
- **[test-supabase.js](database/test-supabase.js)** - Teste de conexão Supabase
- **[init-db.sql](init-db.sql)** - Inicialização do banco (legacy)

### 🔧 Scripts de Configuração
- **[check-uazapi-config.js](check-uazapi-config.js)** - Verificação da configuração UazAPI
- **[seed.ts](seed.ts)** - Dados iniciais do banco

## 🚀 Como Usar

### 1. Scripts de Banco de Dados

#### Configurar Supabase (Recomendado)
```bash
# 1. Acesse Supabase Dashboard
# 2. Vá para SQL Editor
# 3. Execute o arquivo em etapas:
scripts/database/supabase-schema-step-by-step.sql

# 4. Teste a conexão
node scripts/database/test-supabase.js
```

#### Schema Completo (Alternativo)
```bash
# Execute o schema completo de uma vez
# No Supabase SQL Editor:
scripts/database/supabase-schema.sql
```

### 2. Verificar Configurações

#### UazAPI (WhatsApp)
```bash
# Verificar se UazAPI está configurado corretamente
node scripts/check-uazapi-config.js
```

### 3. Dados Iniciais
```bash
# Inserir dados de exemplo (desenvolvimento)
npx tsx scripts/seed.ts
```

## 📋 Scripts Disponíveis

| Script | Descrição | Uso |
|--------|-----------|-----|
| `check-uazapi-config.js` | Verifica configuração UazAPI | `node scripts/check-uazapi-config.js` |
| `seed.ts` | Insere dados iniciais | `npx tsx scripts/seed.ts` |
| `database/test-supabase.js` | Testa conexão Supabase | `node scripts/database/test-supabase.js` |
| `database/supabase-schema.sql` | Schema completo | Execute no Supabase Dashboard |
| `database/supabase-schema-step-by-step.sql` | Schema em etapas | Execute no Supabase Dashboard |

## 🔍 Troubleshooting

### Problemas Comuns

#### ❌ Erro de Conexão com Banco
```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL
echo $SUPABASE_URL

# Testar conexão
node scripts/database/test-supabase.js
```

#### ❌ UazAPI Não Responde
```bash
# Verificar configuração
node scripts/check-uazapi-config.js

# Verificar variáveis
echo $UAZAPI_URL
echo $UAZAPI_TOKEN
```

#### ❌ Erro ao Executar Schema
- Execute o schema em etapas: `supabase-schema-step-by-step.sql`
- Verifique permissões no Supabase
- Consulte [docs/troubleshooting/](../docs/troubleshooting/)

## 📝 Desenvolvimento

### Criar Novos Scripts

1. **Scripts Node.js:** Use `.js` ou `.ts`
2. **Scripts SQL:** Use `.sql` e documente bem
3. **Scripts de Configuração:** Adicione verificações de erro
4. **Documentação:** Atualize este README

### Convenções

- **Nomes:** Use kebab-case (`check-config.js`)
- **Logs:** Use console.log com emojis para clareza
- **Erros:** Sempre trate erros adequadamente
- **Documentação:** Comente código complexo

## 🔗 Links Relacionados

- [Documentação Supabase](../docs/setup/SETUP-SUPABASE.md)
- [Configuração UazAPI](../docs/setup/CONFIGURACAO-UAZAPI.md)
- [Troubleshooting](../docs/troubleshooting/)
- [MCP Server](../mcp-server/)

---

**💡 Dica:** Execute sempre os scripts de teste antes de fazer deploy em produção!