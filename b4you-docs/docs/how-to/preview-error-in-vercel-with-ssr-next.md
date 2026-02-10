---
title: Resolvendo 401/404 em Preview do Checkout no Vercel
---

# Resolvendo 401/404 em Preview do Checkout no Vercel

Este guia rápido explica como corrigir o erro de **401/404** que ocorre ao acessar o Preview do Checkout no Vercel, quando a “Vercel Authentication” está ativada. O fluxo abaixo aplica-se ao cenário em que o usuário possui perfil **Member** no time, sem permissão de Admin para ajustes avançados de proteção.

---

## ✅ Cenário

- **Produção** (branch `main`):  
  - Front e API interna (SSR) rodando em `checkout-ts.b4you.com.br`.  
  - Não há “Vercel Authentication” bloqueando, o SSR faz `/api/offers/...` e recebe status 200.

- **Preview** (branch `dev` → `sandbox-checkout-ts.b4you.com.br`):  
  - O Preview estava protegido por **Vercel Authentication (Standard Protection)**.  
  - Toda requisição ao Preview (página SSR → API interna) exigia login Vercel.  
  - SSR recebia 401/redirect para login e, no catch, o código rodava `{ notFound: true }`, resultando em **404** no navegador.

---

## 🚀 Passo a Passo para Corrigir (como Member)

> **Importante**: Você precisa ter papel **Member** no time Vercel.  
> Como Member, **não é possível**:
> - Ajustar “Branch Tracking”  
> - Criar Protection Bypass  
> - Controlar tokens de acesso do time

A única ação disponível foi **desativar a Vercel Authentication** no Preview, tornando o ambiente de testes público para que o SSR conseguisse chamar a API interna sem bloquear.

1. **Acesse o painel do projeto no Vercel**  
   - Entre em:  
     ```
     https://vercel.com/<seu-time>/b4you-checkout-ts
     ```
   - No menu lateral, clique em **Settings**.

2. **Vá até “Deployment Protection”**  
   - Em Settings, selecione **Deployment Protection** no menu à esquerda.

3. **Desative a “Vercel Authentication”**  
   - Localize a seção **Vercel Authentication** (Standard Protection).  
   - Mude o toggle de **Enabled** para **Disabled**.  
   - Clique em **Save**.  

   ![Vercel Authentication Disabled](attachment:4403f336-637a-4127-8a74-b4d04d93d85c.png)

4. **Atualize o Preview (re-deploy)**  
   - Caso o Preview já estivesse ativo, aguarde alguns minutos para a configuração propagar.  
   - Ou faça um novo deploy de Preview com `vercel` (sem flags), apontando para a branch `dev`.  

5. **Teste o acesso ao Preview**  
   - No navegador, acesse:  
     ```
     https://sandbox-checkout-ts.b4you.com.br/checkout/single/<ID_DA_OFERTA>
     ```
   - O SSR deve chamar a API interna (`api-checkout-sandbox.b4you.com.br/api/offers/<ID>`) e receber JSON 200.  
   - A página agora renderiza corretamente, sem 404.

---

## ⚠️ Por Que Funciona?

- **Antes**: “Vercel Authentication” ativo exigia que qualquer request (página SSR ou API) passasse pela tela de login Vercel. Logo, SSR era bloqueado e retornava 401 → 404.
- **Depois**: Ao desativar a autenticação, o Preview ficou **público**. O SSR pôde chamar a API interna de homolog (`api-checkout-sandbox.b4you.com.br`) sem precisar de login, retornando status 200. O comportamento tornou-se idêntico ao da Produção.

---

## 🎯 Limitação de Permissão

- Seu perfil é **Member** no time, portanto:
  - **Não pode** criar ou editar “Branch Tracking”.  
  - **Não pode** configurar “Protection Bypass”.  
  - **Não pode** gerar ou gerir tokens de automação do time.  
- Por isso, a única intervenção possível foi **desabilitar a autenticação**.  
- Se precisar manter a proteção de Preview no futuro, será necessário ter perfil **Admin** para:
  1. Configurar um **“Protection Bypass”**, adicionando um secret em **Deployment Protection** e enviando `x-vercel-protection-bypass` via interceptor do Axios.  
  2. Ou criar um fluxo de login customizado para que o SSR consiga autenticar antes de chamar a API interna.

---

## 🔒 Importância da “Vercel Authentication”

- **Proteção de Preview**: Garante que apenas membros do time vejam o app de testes.  
- **Sem acesso de Admin**: O Member só consegue desligar a proteção completamente.  
- **Com Admin**:  
  - É possível usar **Protection Bypass** para permitir que o SSR acesse a API sem expor todo o Preview ao público.  
  - Garante controle fino sobre quem e como consome o Preview.

---

## 📌 Conclusão

1. **Identificamos** que o Preview estava retornando 401/404 por causa da autenticação Vercel.  
2. **Como Member**, desativamos a “Vercel Authentication” para liberar o SSR.  
3. **Resultado**: o Preview rodou sem 404, igual à Produção.  
4. **Recomendação futura (Admin)**: usar **Protection Bypass** ou um fluxo de login para manter Preview privado e, ao mesmo tempo, liberar o SSR.

Com essa abordagem, fica documentado o cenário, a ação pontual (desligar autenticação) e as limitações de permissão para quem tem perfil de Member no time.