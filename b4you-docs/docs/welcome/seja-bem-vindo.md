---
title: Boas‐vindas à Documentação Interna B4You
---

# 👋 Bem‐vindos à B4You!

Este é o **repositório de documentação interna** do ecossistema B4You. Aqui você encontrará tudo o que precisa para:

- 👉 **Onboarding** de novos colegas: guias de ambiente, acesso a repositórios, credenciais e primeiros passos.  
- 🚀 **Visão de negócio**: missão, modelos de monetização e principais indicadores.  
- 🛠 **Detalhes técnicos**: arquitetura, infra, APIs, fluxos de desenvolvimento e padrões de código.  
- 📚 **Como fazer**: tutoriais de tarefas comuns (deploy, criação de demanda, inclusão de vídeo, etc.).  
- 🔖 **Referências**: glossário, índice de APIs gerado via Swagger e demais links úteis.

---

## Sobre a B4You  

A **B4You** é a plataforma brasileira de negócios digitais que conecta marcas a uma rede de +100 000 creators e afiliados, permitindo:

- **Integração de lojas** (Shopify, WooCommerce e mais)  
- **Fluxo de checkout otimizado** (3 etapas + upsell/order bump)  
- **Splits automáticos** de comissão para creators/coprodutores  
- **Monitoramento e analytics** em tempo real  
- **Escalabilidade** com infraestrutura AWS e serverless  

Este repositório não é um material de marketing externo - é o ponto único de verdade para **time de desenvolvimento**, **DevOps**, **Suporte** e **Produto**.

---

## Primeiro Passo: Onboarding

1. **Acesso aos sistemas**  
   - Leia `docs/00-welcome/quickstart-onboarding.md` para instruções de:  
     - Configurar SSH e GitHub  
     - Variáveis de ambiente (AWS, Firebase, n8n)  
     - Instalar ferramentas básicas (Node.js, Docker, AWS CLI)  

2. **Mapeamento de repositórios**  
   - Confira `docs/02-technology/repositories/overview.md`  
   - Clone os principais:  
     ```bash
     git clone git@github.com:sixbasebr/sixbase-api.git
     git clone git@github.com:sixbasebr/b4you-infra.git
     # ...e assim por diante
     ```

3. **Ambientes e deploy**  
   - `develop` para homologação (sandbox)  
   - `main` para produção  
   - Veja `docs/02-technology/development/cicd.md` para detalhes dos workflows no GitHub Actions  