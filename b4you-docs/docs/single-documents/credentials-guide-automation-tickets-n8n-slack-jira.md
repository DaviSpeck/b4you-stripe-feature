---
title: "Guia de Ferramentas e Credenciais - Automação de Suporte via N8N, Slack e Jira"
---

# Guia de Ferramentas e Credenciais - Automação de Suporte via N8N, Slack e Jira

Este documento serve como um guia de referência para obter todas as chaves de API, tokens e credenciais necessárias para a configuração dos workflows de automação de suporte no n8n.

---

## 1. Google (para Forms e Sheets)

- **Propósito:** Ponto de entrada das solicitações de suporte.
- **Tipo de Credencial:** `Google OAuth2 API`

### Como Obter:

1. Acesse o **Google Cloud Console** (`console.cloud.google.com`).
2. Crie ou selecione um projeto.
3. No menu "APIs e Serviços", vá para a "Biblioteca" e ative a **"Google Sheets API"** e a **"Google Drive API"**.
4. Vá para a "Tela de consentimento OAuth", configure-a como "Externo" e preencha os dados básicos (nome do app, e-mail de suporte).
5. Vá para "Credenciais", clique em "Criar Credenciais" e selecione "ID do cliente OAuth".
6. Escolha o tipo "Aplicativo da Web".
7. Na seção "URIs de redirecionamento autorizados", adicione a **URL de redirecionamento OAuth** fornecida pelo n8n ao criar a credencial.
8. Copie o **Client ID** e o **Client Secret** gerados e cole-os nos campos correspondentes no n8n.

---

## 2. OpenAI

- **Propósito:** Análise e enriquecimento dos tickets com inteligência artificial.
- **Tipo de Credencial:** `OpenAI API`

### Como Obter:

1. Acesse a plataforma da OpenAI em `platform.openai.com`.
2. Faça login e navegue até a seção **"API Keys"** no menu à esquerda.
3. Clique em **"Create new secret key"**.
4. Dê um nome para a chave (ex: `n8n-automacao-suporte`).
5. **Copie a chave imediatamente.** Ela não será exibida novamente.
6. Cole esta chave no campo "API Key" ao criar a credencial OpenAI no n8n.
7. **Nota:** É necessário ter um método de pagamento configurado na sua conta OpenAI para uso da API além do nível gratuito inicial.

---

## 3. Slack

- **Propósito:** Enviar notificações interativas para aprovação dos gestores.
- **Tipo de Credencial:** `Slack OAuth2 API` (usando um App personalizado)

### Como Obter:

1. Acesse o site da API do Slack em `api.slack.com/apps` e clique em **"Create New App"** (selecione "From scratch").
2. Dê um nome ao seu app (ex: `Bot de Suporte N8N`) e associe-o ao seu workspace.
3. No menu do app, vá para **"OAuth & Permissions"**:
   - Adicione a **Redirect URL** fornecida pela sua credencial do n8n.
   - Em "Scopes", adicione as permissões necessárias para o Bot Token, como `chat:write` (para enviar mensagens).
4. No menu, vá para **"Interactivity & Shortcuts"**:
   - Ative a interatividade.
   - No campo **"Request URL"**, cole a URL do **Webhook do seu Workflow 2** (o que recebe a resposta).
5. No menu, vá para **"Basic Information"**:
   - Role para baixo até a seção "App Credentials".
   - Copie o **Client ID** e o **Client Secret**.
6. Cole o Client ID e o Client Secret nos campos correspondentes ao criar a credencial do Slack no n8n.

---

## 4. Jira Software Cloud

- **Propósito:** Plataforma final de gestão de tarefas onde os tickets aprovados são criados.
- **Tipo de Credencial:** `Jira API`

### Como Obter:

1. Acesse seu perfil Atlassian em `id.atlassian.com/manage-profile/security/api-tokens`.
2. Clique em **"Criar e gerenciar tokens de API"** e depois em **"Criar token de API"**.
3. Dê um **Rótulo (Label)** descritivo ao token (ex: `n8n-jira-integration`).
4. **Copie o token gerado imediatamente.** Ele não será mostrado novamente.
5. Ao criar a credencial no n8n, você precisará de três informações:
   - **Email:** Seu e-mail de login no Jira.
   - **API Token:** O token que você acabou de copiar.
   - **Domain:** A URL base da sua instância Jira (ex: `https://sua-empresa.atlassian.net`).