# 👥 Sistema de Usuários - Moobi Chat

## 📋 Como Usar o Sistema de Usuários Reais

Agora o Moobi Chat possui um sistema completo de usuários com banco de dados real.

## 🚀 **1. Criar Primeiro Usuário**

### Acesse a página de registro:
```
http://localhost:3000/auth/register
```

### Preencha os dados:
- **Nome**: Seu nome completo
- **Email**: seu@email.com
- **Senha**: Mínimo 6 caracteres
- **Confirmar Senha**: Repita a senha

### O que é criado automaticamente:
- ✅ Conta de usuário
- ✅ Workspace pessoal
- ✅ Plataforma WhatsApp
- ✅ Board Kanban com 4 colunas

## 🔑 **2. Fazer Login**

### Acesse a página de login:
```
http://localhost:3000/auth/signin
```

### Opções de login:

#### **A) Usuário Real (Recém-criado)**
- Email: Seu email cadastrado
- Senha: Sua senha

#### **B) Usuários de Teste (Desenvolvimento)**
- `admin@moobi.test` / `123456`
- `operador@moobi.test` / `123456`
- `supervisor@moobi.test` / `123456`

## 🛠️ **3. Administrar Usuários**

### Página de administração:
```
http://localhost:3000/admin/users
```

### Funcionalidades:
- ✅ Ver todos os usuários criados
- ✅ Ver workspaces de cada usuário
- ✅ Deletar usuários
- ✅ Copiar IDs
- ✅ Links para registro/login

## 📊 **4. APIs Disponíveis**

### **Registrar Usuário**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "minhasenha123"
}
```

### **Listar Usuários** (Admin)
```bash
GET /api/admin/users
```

### **Deletar Usuário** (Admin)
```bash
DELETE /api/admin/users?userId=uuid-do-usuario
```

## ⚙️ **5. Configuração de Ambiente**

### **Para usar usuários reais:**
```bash
# No .env.local
MOCK_DATA_ENABLED="false"
```

### **Para voltar aos dados mockados:**
```bash
# No .env.local
MOCK_DATA_ENABLED="true"
```

## 🔄 **6. Fluxo Completo de Teste**

1. **Criar `.env.local`**:
   ```bash
   cp env.example .env.local
   ```

2. **Verificar banco configurado** (Supabase)

3. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

4. **Criar primeiro usuário**:
   - Ir para `/auth/register`
   - Preencher formulário
   - Confirmar criação

5. **Fazer login**:
   - Ir para `/auth/signin`
   - Login com novo usuário

6. **Acessar dashboard**:
   - Automaticamente redirecionado
   - Explorar funcionalidades

7. **Testar WhatsApp**:
   - Ir para `/dashboard/integrations`
   - Conectar WhatsApp com UazAPI

## 🔧 **7. Estrutura Criada Automaticamente**

### **Para cada usuário novo:**

```
Usuário
├── Workspace "{Nome} - Workspace"
├── Plataforma WhatsApp Principal
└── Board Kanban "Atendimento"
    ├── Coluna: Novo
    ├── Coluna: Em Andamento
    ├── Coluna: Aguardando
    └── Coluna: Resolvido
```

## 🚨 **8. Notas Importantes**

### **Segurança Temporária:**
- Por enquanto, a autenticação é simplificada
- Em produção, implementar hash de senhas completo
- Adicionar campo `password` na tabela `users`

### **Desenvolvimento:**
- Usuários mockados ainda funcionam
- Útil para testes rápidos
- Fácil alternância via `MOCK_DATA_ENABLED`

### **Banco de Dados:**
- Todos os dados são persistidos no Supabase
- Deletar usuário remove todos os dados relacionados
- Backup recomendado antes de deletar

## 📝 **9. Próximos Passos**

### **Para produção:**
- [ ] Implementar hash de senha completo
- [ ] Adicionar recuperação de senha
- [ ] Implementar níveis de acesso
- [ ] Sistema de convites
- [ ] Auditoria de ações

### **Para desenvolvimento:**
- [ ] Validação de email
- [ ] Upload de avatar
- [ ] Configurações de usuário
- [ ] Notificações

## 🆘 **10. Troubleshooting**

### **Erro: "Usuário não encontrado"**
- Verificar se foi criado via `/auth/register`
- Conferir email digitado
- Verificar se banco está conectado

### **Erro: "DATABASE_URL inválida"**
- Verificar `.env.local` existe
- Conferir credenciais Supabase
- Verificar se SQL foi executado

### **Login não funciona:**
- Verificar se `MOCK_DATA_ENABLED="false"`
- Verificar se usuário existe em `/admin/users`
- Verificar logs do console

---

**Agora você tem um sistema completo de usuários funcionando! 🎉** 