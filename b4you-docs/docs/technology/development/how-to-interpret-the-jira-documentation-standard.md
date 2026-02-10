---
title: Como Interpretar o Padrão de Documentação do Jira
---

# Como Interpretar o Padrão de Documentação do Jira

Este guia ajuda **desenvolvedores** a entender e utilizar corretamente as informações que o Head de Tecnologia registra em cada demanda no Jira. Siga estes passos para extrair o máximo valor de cada campo antes de iniciar o desenvolvimento.

---

## 1. User Story

> **Exemplo**  
> **Como** analista/comercial da B4You  
> **Quero** visualizar indicadores segmentados de performance  
> **Para** tomar decisões estratégicas e reativar produtores inativos

**O que esperar:**  
- Quem: qual perfil do usuário final  
- O quê: funcionalidade desejada  
- Por quê: objetivo de negócio

**Para o dev:** utilize essa visão para validar que seu código atende ao cenário de uso e ao fluxo de interação descrito.

---

## 2. Critérios de Aceite

> **Formato “DADO / QUANDO / ENTÃO”**  
> - Dado que estou no backoffice …  
> - Quando clico …  
> - Então devo …

**O que esperar:** lista objetiva de condições que definem “pronto” para esta demanda.

**Para o dev:**  
1. Crie testes manuais (ou automatizados) que cubram **cada** critério listado.  
2. Marque cada critério como concluído só quando comprovado em ambiente de homologação.

---

## 3. Funcionalidades Requeridas

> **O que o Head descreve:**  
> - Indicadores (PRM, PD10K, etc.)  
> - Filtros (período, categoria, faixa de venda…)  
> - Ações (botão WhatsApp, notas, tags)

**O que esperar:** o escopo técnico mínimo. São “todo o conjunto” de itens que a funcionalidade deve cobrir.

**Para o dev:**  
- Organize sua **listagem de tarefas** (task breakdown) a partir desses itens.  
- Garanta que nenhum filtro ou ação listado fique de fora do seu checklist de implementação.

---

## 4. Subtarefas Técnicas Sugeridas

> **Exemplo:**  
> - Back-End: criar endpoints, implementar cache…  
> - Front-End: montar dashboard, filtros…  
> - QA: validar dados, testes de fluxo

**O que esperar:** diretrizes iniciais, mas não um passo-a-passo exaustivo.

**Para o dev:** refine essas sugestões em **tarefas atômicas** (issues menores) no seu board e adicione qualquer passo extra que precise.

---

## 5. Fluxo de Trabalho Recomendado

1. **Leitura Completa**: abra o ticket e percorra todos os campos acima.  
2. **Esclarecimento**: se algum termo, métrica ou requisito não estiver claro, pergunte **antes** de codar.  
3. **Task Breakdown**: transforme “Funcionalidades Requeridas” e “Subtarefas Técnicas” em um checklist ou sub-issues.  
4. **Implementação**: siga nossa convenção de branches e commits.  
5. **Validação**: execute um checklist manual baseado nos “Critérios de Aceite”.  
6. **Feedback**: finalize o ticket com comentários citando quais critérios foram atendidos e como testá-los.

---

## 6. Dicas Práticas

- **Padronize sua nomenclatura** de branch a partir do **ID** do ticket e da descrição curta (`feature/B4YOU-123-indicadores`).  
- **Copie e cole** a User Story e os Critérios de Aceite no início do Pull Request para facilitar a revisão.  
- **Referencie métricas** (PRM, PD10K…) exatamente como estão no ticket, evitando ambiguidades.  
- **Marque revisores** de negócio (analistas/PM) se quiser validação direta dos critérios antes do merge.

---

> 🎯 Com este guia, você aproveita ao máximo o trabalho do Head de Tecnologia, reduz dúvidas e acelera entregas com segurança e alinhamento ao negócio.  