# TARGET: Backoffice Management Scripts

Este conjunto de scripts permite gerenciar completamente o sistema de roles, menu items e permissões do backoffice.

## INFO: Scripts Disponíveis

### 1. **backoffice-manager.js** - Script Principal
Script master que coordena todas as operações do sistema.

### 2. **backoffice-role-manager.js** - Gerenciador de Roles
Gerencia roles do sistema (criar, remover, listar, detalhes).

### 3. **backoffice-menu-manager.js** - Gerenciador de Menu Items
Gerencia itens do menu (criar, remover, atualizar, listar).

### 4. **backoffice-role-menu-linker.js** - Linker de Permissões
Gerencia associações entre roles e menu items.

### 5. **backoffice-user-role-assigner.js** - Atribuidor de Roles
Atribui e remove roles dos usuários do backoffice.

## START: Início Rápido

### 1. Configurar Sistema Padrão
```bash
node scripts/backoffice-manager.js setup
```
### 2. Verificar Status
```bash
node scripts/backoffice-manager.js status
```

## DESC: Guia de Uso Detalhado

### ROLE: Gerenciar Roles

```bash
# Adicionar role
node scripts/backoffice-manager.js role add "Editor" "Editor de conteúdo"

# Remover role
node scripts/backoffice-manager.js role remove "Editor"

# Listar todas as roles
node scripts/backoffice-manager.js role list

# Ver detalhes de uma role
node scripts/backoffice-manager.js role details "Admin"
```

### INFO: Gerenciar Menu Items

```bash
# Adicionar menu item
node scripts/backoffice-manager.js menu add "blog" "/blog"

# Remover menu item
node scripts/backoffice-manager.js menu remove "blog"

# Atualizar rota de um menu item
node scripts/backoffice-manager.js menu update "blog" "/admin/blog"

# Listar todos os menu items
node scripts/backoffice-manager.js menu list

# Ver detalhes de um menu item
node scripts/backoffice-manager.js menu details "blog"
```

### LINK: Gerenciar Permissões (Role ↔ Menu Items)

```bash
# Linkar role a menu items (separados por vírgula)
node scripts/backoffice-manager.js link link "Editor" "blog,dashboard"

# Deslinkar role de menu items específicos
node scripts/backoffice-manager.js link unlink "Editor" "dashboard"

# Remover todas as associações de uma role
node scripts/backoffice-manager.js link unlink-all-role "Editor"

# Remover todas as associações de um menu item
node scripts/backoffice-manager.js link unlink-all-menu "blog"

# Listar todas as associações
node scripts/backoffice-manager.js link list
```

### USERS: Gerenciar Usuários e Roles

```bash
# Atribuir role a um usuário
node scripts/backoffice-manager.js user assign "editor@example.com" "Editor"
node scripts/backoffice-manager.js user assign 1 "Editor"  # Por ID

# Remover role de um usuário
node scripts/backoffice-manager.js user remove "editor@example.com"

# Listar todos os usuários e suas roles
node scripts/backoffice-manager.js user list-users

# Ver detalhes de um usuário
node scripts/backoffice-manager.js user user-details "editor@example.com"

# Listar usuários por role
node scripts/backoffice-manager.js user list-by-role "Editor"
```

## TARGET: Exemplos Práticos

### Cenário 1: Criar Sistema de Editor
```bash
# 1. Criar role de Editor
node scripts/backoffice-manager.js role add "Editor" "Editor de conteúdo"

# 2. Criar menu items para editor
node scripts/backoffice-manager.js menu add "articles" "/articles"
node scripts/backoffice-manager.js menu add "categories" "/categories"

# 3. Linkar permissões
node scripts/backoffice-manager.js link link "Editor" "dashboard,articles,categories"

# 4. Atribuir role a usuário
node scripts/backoffice-manager.js user assign "editor@example.com" "Editor"
```

### Cenário 2: Criar Sistema de Suporte
```bash
# 1. Criar role de Support (já existe no setup padrão)
# 2. Criar menu items específicos para suporte
node scripts/backoffice-manager.js menu add "tickets" "/support/tickets"
node scripts/backoffice-manager.js menu add "faq" "/support/faq"

# 3. Atualizar permissões do Support
node scripts/backoffice-manager.js link unlink-all-role "Support"
node scripts/backoffice-manager.js link link "Support" "dashboard,users,notifications,tickets,faq"

# 4. Atribuir a usuários de suporte
node scripts/backoffice-manager.js user assign "support1@example.com" "Support"
node scripts/backoffice-manager.js user assign "support2@example.com" "Support"
```

### Cenário 3: Auditoria e Manutenção
```bash
# Ver status geral
node scripts/backoffice-manager.js status

# Listar todas as permissões
node scripts/backoffice-manager.js link list

# Ver usuários sem role
node scripts/backoffice-manager.js user list-users

# Ver detalhes de uma role específica
node scripts/backoffice-manager.js role details "Admin"
```

## Configuração

### Variáveis de Ambiente Necessárias
Certifique-se de que as seguintes variáveis estão configuradas:

```env
MYSQL_USERNAME=seu_usuario
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=seu_database
MYSQL_HOST=localhost
MYSQL_PORT=3306
DATABASE_DIALECT=mysql
```

### Execução com Dialect
Se encontrar erro de dialect, execute com a variável definida:

```bash
DATABASE_DIALECT=mysql node scripts/backoffice-manager.js setup
```

## STATS: Estrutura do Banco

### Tabelas Criadas
- `backoffice_roles` - Roles do sistema
- `menu_items` - Itens do menu
- `menu_items_roles` - Associação many-to-many entre roles e menu items
- `users_backoffice` - Usuários do backoffice (atualizada com campo `id_role`)

### Relacionamentos
- `users_backoffice` → `backoffice_roles` (belongsTo)
- `backoffice_roles` → `menu_items` (belongsToMany)
- `menu_items` → `backoffice_roles` (belongsToMany)

## WARNING: Importante

1. **Backup**: Sempre faça backup antes de executar em produção
2. **Teste**: Teste primeiro em ambiente de desenvolvimento
3. **Ordem**: Execute as migrations antes de usar os scripts
4. **Permissões**: Verifique se as migrations foram executadas corretamente

## Solução de Problemas

### Erro de Dialect
```bash
DATABASE_DIALECT=mysql node scripts/backoffice-manager.js setup
```

### Erro de Conexão
Verifique as variáveis de ambiente e se o banco está rodando.

### Tabelas Não Encontradas
Execute as migrations primeiro:
```bash
npx sequelize-cli db:migrate
```

## DESC: Logs

Os scripts fornecem feedback detalhado sobre:
- SUCCESS: Operações bem-sucedidas
- WARNING: Avisos (ex: item já existe)
- ERROR: Erros com detalhes
- INFO: Informações e listagens
- TARGET: Resumos de operações
