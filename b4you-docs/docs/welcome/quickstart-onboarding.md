---
title: Quickstart Onboarding
---

# 🚀 Onboarding Rápido na B4You

Este guia leva você, em poucos minutos, do zero ao primeiro setup de desenvolvimento local.

---

## 1. Pré-requisitos

- **Conta GitHub** na organização `sixbasebr` (acesse: https://github.com/sixbasebr)  
- **Permissões AWS** (IAM): acesso de leitura/gravação nos ambientes `dev` e `prod`  
- **Node.js** (v16+), **Yarn** ou **npm**  
- **Docker** (opcional, para rodar containers localmente)  
- **AWS CLI** configurado com perfil `b4you-dev` e `b4you-prod`

---

## 2. Acessos e Credenciais

1. **GitHub**  
   - Solicite no Slack o convite para o time `sixbasebr`.  
   - Clone SSH keys:  
     ```bash
     ssh-keygen -t ed25519 -C "seu.email@empresa.com"
     cat ~/.ssh/id_ed25519.pub # envie ao time
     ```
2. **AWS**  
   - Receba suas credenciais (Access Key ID / Secret) do time DevOps.  
   - Configure profiles:
     ```bash
     aws configure --profile b4you-dev
     aws configure --profile b4you-prod
     ```
3. **Variáveis de ambiente**  
   Crie um `.env.local` na raiz de cada front-end/API com:
   ```env
   NODE_ENV=development
   API_URL=https://api-dev.b4you.com.br
   AWS_PROFILE=b4you-dev