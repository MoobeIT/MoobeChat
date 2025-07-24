# 🛠️ Ferramentas de Banco de Dados - Moobi Chat

Este diretório contém uma coleção de ferramentas para visualização, monitoramento e manutenção do banco de dados durante o desenvolvimento.

## 📋 Ferramentas Disponíveis

### 1. 🔍 `inspect-database.js` - Inspeção Básica
**Propósito**: Verificação rápida da estrutura e dados do banco.

```bash
# Executar inspeção básica
node scripts/inspect-database.js
```

**O que faz**:
- Lista todas as tabelas e contagem de registros
- Mostra dados das plataformas com configurações
- Exibe conversas e mensagens recentes
- Verifica conectividade com Supabase

---

### 2. 📊 `database-monitor.js` - Monitor em Tempo Real
**Propósito**: Monitoramento contínuo dos dados durante desenvolvimento.

```bash
# Verificação única
node scripts/database-monitor.js --once

# Monitoramento contínuo (atualiza a cada 5 segundos)
node scripts/database-monitor.js

# Monitoramento com intervalo personalizado (10 segundos)
node scripts/database-monitor.js --interval=10
```

**O que faz**:
- 📈 Estatísticas em tempo real das tabelas
- 🔌 Status das plataformas ativas
- 💬 Conversas recentes
- 📨 Mensagens recentes
- 🔄 Atualização automática com indicadores de mudança

**Controles**:
- `Ctrl+C` para parar o monitoramento
- Tela limpa automaticamente a cada atualização

---

### 3. 🔬 `database-analyzer.js` - Análise Avançada
**Propósito**: Análise detalhada de integridade e performance.

```bash
# Análise completa
node scripts/database-analyzer.js

# Análise de plataforma específica
node scripts/database-analyzer.js --platform cmd6nujkh0001m9mwocvky970

# Apenas verificação de integridade
node scripts/database-analyzer.js --integrity

# Apenas análise de performance
node scripts/database-analyzer.js --performance

# Apenas verificação do ambiente
node scripts/database-analyzer.js --env
```

**O que faz**:
- 🔍 **Integridade**: Detecta dados órfãos (plataformas sem workspace, conversas sem plataforma, etc.)
- 📊 **Performance**: Identifica conversas mais ativas, plataformas por atividade
- 🔧 **Ambiente**: Verifica conexão e variáveis de ambiente
- 📱 **Plataforma específica**: Análise detalhada de uma plataforma

---

### 4. 🔧 `database-fixer.js` - Correção de Problemas
**Propósito**: Corrige problemas de integridade automaticamente.

```bash
# Correção completa
node scripts/database-fixer.js

# Corrigir apenas dados órfãos
node scripts/database-fixer.js --orphans-only

# Limpar dados de teste
node scripts/database-fixer.js --clean-test
```

**O que faz**:
- 🔗 **Órfãos**: Corrige ou remove dados órfãos
- 🧹 **Limpeza**: Remove dados de teste/desenvolvimento
- ⚡ **Otimização**: Remove conversas vazias
- 🔄 **Reassociação**: Move dados para workspaces/plataformas válidas

---

## 🚀 Fluxo de Trabalho Recomendado

### Durante o Desenvolvimento
1. **Inicie o monitor** para acompanhar mudanças:
   ```bash
   node scripts/database-monitor.js
   ```

2. **Execute sua aplicação** em outro terminal

3. **Observe as mudanças** em tempo real no monitor

### Para Debugging
1. **Análise completa** para identificar problemas:
   ```bash
   node scripts/database-analyzer.js
   ```

2. **Correção automática** se necessário:
   ```bash
   node scripts/database-fixer.js
   ```

3. **Verificação pós-correção**:
   ```bash
   node scripts/database-analyzer.js --integrity
   ```

### Antes de Deploy
1. **Limpeza de dados de teste**:
   ```bash
   node scripts/database-fixer.js --clean-test
   ```

2. **Verificação final**:
   ```bash
   node scripts/database-analyzer.js
   ```

---

## 📊 Interpretando os Resultados

### Ícones do Monitor
- 🟢 **Verde**: Ativo/Conectado/OK
- 🔴 **Vermelho**: Inativo/Desconectado/Erro
- 🟡 **Amarelo**: Pendente/Em processamento
- 📈 **Seta para cima**: Aumento nos dados
- 📉 **Seta para baixo**: Diminuição nos dados
- ➖ **Traço**: Sem mudança

### Status das Plataformas
- 📱 **WhatsApp**
- 💬 **Outras plataformas**
- `connected`: Plataforma conectada e funcionando
- `disconnected`: Plataforma desconectada
- `error`: Erro na plataforma

### Status das Conversas
- 🟢 `OPEN`: Conversa ativa
- 🔴 `CLOSED`: Conversa fechada
- 🟡 `PENDING`: Conversa pendente

### Direção das Mensagens
- ⬅️ `INCOMING`: Mensagem recebida
- ➡️ `OUTGOING`: Mensagem enviada

---

## ⚠️ Problemas Comuns

### "Plataformas órfãs encontradas"
**Causa**: Plataforma referencia um workspace que não existe.
**Solução**: Execute `database-fixer.js` para reassociar automaticamente.

### "Conversas órfãs encontradas"
**Causa**: Conversa referencia uma plataforma que não existe.
**Solução**: Execute `database-fixer.js --orphans-only`.

### "Erro na conexão com Supabase"
**Causa**: Problemas de rede ou configuração.
**Solução**: Verifique as variáveis de ambiente com `--env`.

### "Project reference in URL is not valid"
**Causa**: URL do Supabase incorreta no MCP.
**Solução**: Use as ferramentas locais em vez do MCP.

---

## 🔧 Configuração

### Variáveis de Ambiente Necessárias
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
NEXTAUTH_SECRET=sua-chave-secreta
UAZAPI_URL=https://free.uazapi.com
UAZAPI_TOKEN=seu-token-uazapi
```

### Dependências
Todas as ferramentas usam as dependências já instaladas:
- `@supabase/supabase-js`
- `dotenv`

---

## 💡 Dicas de Uso

1. **Mantenha o monitor rodando** durante desenvolvimento para detectar problemas rapidamente

2. **Execute o analyzer regularmente** para manter a integridade dos dados

3. **Use o fixer com cuidado** em produção - sempre faça backup antes

4. **Monitore as mudanças** nos contadores para detectar vazamentos de dados

5. **Verifique o ambiente** se houver problemas de conexão

---

## 🆘 Suporte

Se encontrar problemas:
1. Execute `database-analyzer.js --env` para verificar a configuração
2. Verifique os logs de erro detalhados
3. Use `database-fixer.js` para correções automáticas
4. Em último caso, acesse o Supabase Dashboard diretamente

---

**Desenvolvido para Moobi Chat** 🚀
*Ferramentas que facilitam o desenvolvimento e manutenção do banco de dados*