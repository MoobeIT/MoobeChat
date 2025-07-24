# 🗂️ Organização do Projeto Moobi Chat

> **Reorganizado em:** 18 de Julho de 2025

Guia rápido para navegar na nova estrutura organizada do projeto.

## 📁 Estrutura Atual

```
MoobeChat/
├── 📄 README.md                    # Documentação principal
├── 📄 CHANGELOG.md                 # Histórico de mudanças
├── 📄 ORGANIZACAO-PROJETO.md       # Este arquivo
├── 📄 .gitignore                   # Arquivos ignorados
│
├── 📂 src/                         # 💻 CÓDIGO FONTE
│   ├── app/                        # Páginas Next.js
│   ├── components/                 # Componentes React
│   ├── lib/                        # Bibliotecas
│   └── types/                      # Tipos TypeScript
│
├── 📂 config/                      # ⚙️ CONFIGURAÇÕES
│   ├── README.md                   # Guia das configurações
│   ├── claude-desktop-config.json  # Config Claude Desktop
│   ├── cursor-mcp-config.json      # Config Cursor IDE
│   └── env.example                 # Template variáveis
│
├── 📂 docs/                        # 📚 DOCUMENTAÇÃO
│   ├── README.md                   # Índice geral
│   ├── setup/                      # Guias de instalação
│   ├── database/                   # Docs técnicas do banco
│   ├── troubleshooting/            # Soluções de problemas
│   └── archive/                    # Documentos antigos
│
├── 📂 scripts/                     # 🛠️ SCRIPTS
│   ├── README.md                   # Guia dos scripts
│   ├── database/                   # Scripts de banco
│   ├── check-uazapi-config.js      # Verificar UazAPI
│   └── seed.ts                     # Dados iniciais
│
├── 📂 mcp-server/                  # 🤖 SERVIDOR MCP
│   ├── index.js                    # Servidor principal
│   ├── test-mcp.js                 # Testes
│   └── package.json                # Dependências
│
├── 📂 examples/                    # 📋 EXEMPLOS
├── 📂 prisma/                      # 🗄️ PRISMA (LEGACY)
└── 📂 db/                          # 🗄️ BANCO (LEGACY)
```

## 🚀 Navegação Rápida

### 🔍 Procurando por...

| Preciso de... | Vá para... |
|---------------|------------|
| **Instalar o projeto** | [`docs/setup/INSTALACAO.md`](docs/setup/INSTALACAO.md) |
| **Configurar banco** | [`docs/setup/SETUP-SUPABASE.md`](docs/setup/SETUP-SUPABASE.md) |
| **Configurar MCP** | [`docs/setup/CONFIGURACAO-MCP-COMPLETA.md`](docs/setup/CONFIGURACAO-MCP-COMPLETA.md) |
| **Configurar WhatsApp** | [`docs/setup/CONFIGURACAO-UAZAPI.md`](docs/setup/CONFIGURACAO-UAZAPI.md) |
| **Resolver problemas** | [`docs/troubleshooting/`](docs/troubleshooting/) |
| **Entender o banco** | [`docs/database/`](docs/database/) |
| **Executar scripts** | [`scripts/`](scripts/) |
| **Configurar ambiente** | [`config/env.example`](config/env.example) |
| **Testar MCP** | [`mcp-server/test-mcp.js`](mcp-server/test-mcp.js) |

### 📚 Documentação por Categoria

#### 🔧 Setup e Configuração
- **Instalação:** [`docs/setup/INSTALACAO.md`](docs/setup/INSTALACAO.md)
- **Supabase:** [`docs/setup/SETUP-SUPABASE.md`](docs/setup/SETUP-SUPABASE.md)
- **MCP:** [`docs/setup/CONFIGURACAO-MCP-COMPLETA.md`](docs/setup/CONFIGURACAO-MCP-COMPLETA.md)
- **UazAPI:** [`docs/setup/CONFIGURACAO-UAZAPI.md`](docs/setup/CONFIGURACAO-UAZAPI.md)

#### 🗄️ Banco de Dados
- **Migração:** [`docs/database/MIGRATION_GUIDE.md`](docs/database/MIGRATION_GUIDE.md)
- **Estrutura:** [`docs/database/ESTRUTURA-BACKEND.md`](docs/database/ESTRUTURA-BACKEND.md)
- **Usuários:** [`docs/database/SISTEMA-USUARIOS.md`](docs/database/SISTEMA-USUARIOS.md)

#### 🔧 Troubleshooting
- **Problemas Gerais:** [`docs/troubleshooting/SOLUCOES-PROBLEMAS.md`](docs/troubleshooting/SOLUCOES-PROBLEMAS.md)
- **Instâncias Fantasma:** [`docs/troubleshooting/CORRECAO-INSTANCIAS-FANTASMA.md`](docs/troubleshooting/CORRECAO-INSTANCIAS-FANTASMA.md)

## 🎯 Fluxo de Trabalho

### 1. 🆕 Novo Desenvolvedor
```bash
# 1. Ler documentação principal
cat README.md

# 2. Seguir guia de instalação
open docs/setup/INSTALACAO.md

# 3. Configurar ambiente
cp config/env.example .env.local

# 4. Executar scripts de banco
# (Seguir docs/setup/SETUP-SUPABASE.md)
```

### 2. 🐛 Resolver Problema
```bash
# 1. Consultar troubleshooting
open docs/troubleshooting/

# 2. Verificar configurações
node scripts/check-uazapi-config.js

# 3. Testar conexões
node scripts/database/test-supabase.js
```

### 3. 🔧 Configurar Nova Feature
```bash
# 1. Consultar documentação técnica
open docs/database/

# 2. Verificar exemplos
open examples/

# 3. Testar com MCP
node mcp-server/test-mcp.js
```

## 📝 Convenções

### 📁 Nomes de Pastas
- **Minúsculas:** `docs`, `config`, `scripts`
- **Descritivas:** `troubleshooting`, `database`
- **Inglês:** Para código, português para docs

### 📄 Nomes de Arquivos
- **MAIÚSCULAS:** Documentação importante (`README.md`)
- **kebab-case:** Scripts (`check-config.js`)
- **Descritivos:** `CONFIGURACAO-MCP-COMPLETA.md`

### 📚 Documentação
- **README.md:** Em cada pasta como índice
- **Emojis:** Para facilitar navegação visual
- **Links relativos:** Entre documentos
- **Datas:** Sempre incluir data de atualização

## 🔄 Manutenção

### ✅ Checklist Mensal
- [ ] Atualizar datas nos READMEs
- [ ] Verificar links quebrados
- [ ] Mover docs obsoletos para `archive/`
- [ ] Atualizar `CHANGELOG.md`

### 📋 Ao Adicionar Novos Arquivos
- [ ] Colocar na pasta apropriada
- [ ] Atualizar README da pasta
- [ ] Adicionar ao `.gitignore` se necessário
- [ ] Documentar no `CHANGELOG.md`

---

**🎉 Projeto organizado e pronto para desenvolvimento eficiente!**