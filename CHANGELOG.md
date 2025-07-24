# 📝 Changelog - Moobi Chat

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Reorganização] - 2025-07-18

### 🗂️ Estrutura Reorganizada

#### ✅ Adicionado
- **📂 config/**: Centralizou arquivos de configuração
  - `claude-desktop-config.json` (movido da raiz)
  - `cursor-mcp-config.json` (movido da raiz)
  - `env.example` (movido da raiz)
  - `README.md` (novo)

- **📂 docs/**: Documentação organizada por categoria
  - **setup/**: Guias de instalação e configuração
    - `INSTALACAO.md`
    - `SETUP-SUPABASE.md`
    - `INSTRUCOES-SUPABASE.md`
    - `CONFIGURACAO-MCP-COMPLETA.md`
    - `CONFIGURACAO-UAZAPI.md`
  - **database/**: Documentação técnica do banco
    - `MIGRATION_GUIDE.md`
    - `DESENVOLVIMENTO.md`
    - `ESTRUTURA-BACKEND.md`
    - `SISTEMA-USUARIOS.md`
  - **troubleshooting/**: Soluções de problemas
    - `SOLUCOES-PROBLEMAS.md`
    - `CORRECAO-INSTANCIAS-FANTASMA.md`
    - `SOLUCAO-PRIMEIRA-TENTATIVA.md`
    - `SOLUCAO-SERVIDOR-GRATUITO.md`
  - **archive/**: Documentos antigos
    - `TESTE-MENSAGENS.md`
    - `INTEGRACAO-UAZAPI.md`
  - `README.md` (índice geral)

- **📂 scripts/database/**: Scripts de banco organizados
  - `supabase-schema.sql` (movido da raiz)
  - `supabase-schema-step-by-step.sql` (movido da raiz)
  - `test-supabase.js` (movido da raiz)

- **📄 Novos READMEs**: Índices para cada pasta
  - `docs/README.md`
  - `config/README.md`
  - `scripts/README.md`

#### 🔄 Modificado
- **📄 README.md principal**: Completamente reescrito
  - Estrutura mais clara e organizada
  - Links para documentação específica
  - Status atual do projeto
  - Guia de início rápido

- **📄 .gitignore**: Atualizado
  - Adicionadas novas pastas organizadas
  - Removidas duplicações
  - Melhor organização por categoria

#### 🗑️ Removido da Raiz
- Arquivos de documentação dispersos (movidos para `docs/`)
- Arquivos de configuração (movidos para `config/`)
- Scripts de banco (movidos para `scripts/database/`)

### 🎯 Benefícios da Reorganização

1. **📁 Navegação Mais Fácil**
   - Documentação categorizada
   - Estrutura lógica e intuitiva
   - READMEs como índices

2. **🔧 Configuração Centralizada**
   - Todos os configs em uma pasta
   - Fácil backup e versionamento
   - Documentação específica

3. **📚 Documentação Organizada**
   - Por categoria (setup, database, troubleshooting)
   - Fácil localização de informações
   - Histórico preservado em archive

4. **🛠️ Scripts Organizados**
   - Scripts de banco separados
   - Documentação específica
   - Fácil manutenção

### 🔗 Impacto nos Links

#### ⚠️ Links Atualizados
- Documentação: `docs/categoria/arquivo.md`
- Configurações: `config/arquivo`
- Scripts: `scripts/categoria/arquivo`

#### ✅ Compatibilidade
- Código fonte: Sem alterações
- Funcionalidades: Mantidas
- Dependências: Inalteradas

---

## Versões Anteriores

### [Setup Inicial] - 2025-07-XX
- Configuração inicial do projeto
- Integração com Supabase
- Servidor MCP funcional
- Integração UazAPI

---

**📋 Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**