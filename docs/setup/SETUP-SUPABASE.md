# 🚀 Configuração do Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Escolha sua organização
4. Nome do projeto: `MoobeChat`
5. Senha do banco: `[gere uma senha forte]`
6. Região: `South America (São Paulo)`
7. Clique em "Create new project"

## Passo 2: Obter Credenciais

1. Aguarde o projeto ser criado (1-2 minutos)
2. Vá em **Settings** > **Database**
3. Copie as seguintes informações:

### Connection String (URI)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Pooler Connection String
```
postgresql://postgres:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.co:6543/postgres
```

### Project URL
```
https://[PROJECT-REF].supabase.co
```

### Anon Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 3: Atualizar .env.local

```bash
# Database - Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.co:6543/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

## Passo 4: Configurar Banco

```bash
# Copiar para .env
copy .env.local .env

# Fazer push do schema
npx prisma db push

# Gerar cliente
npx prisma generate
```

## Passo 5: Testar Conexão

```bash
# Abrir Prisma Studio
npx prisma studio

# Ou testar diretamente
npm run dev
``` 