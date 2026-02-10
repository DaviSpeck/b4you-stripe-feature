---
title: Casos de Exceção no Fluxo de Revisão de PRs
---

# Casos de Exceção no Fluxo de Revisão de PRs

Este documento descreve situações em que o fluxo padrão de Pull Requests (PRs) pode não se aplicar integralmente. Sempre que algum desses cenários ocorrer, siga as orientações abaixo e comunique ao Vini para alinhamento.

---

### 1. Solicitação de Revisão Adicional

- **Quando usar**:
  - Se o Vini estiver submetendo uma demanda (ex.: correção, melhoria ou feature) e, durante o desenvolvimento, precisar de uma segunda opinião ou sugestão em um trecho específico.
  - Se houver dúvidas sobre a complexidade da mudança ou risco de impacto em outro módulo.

- **Como proceder**:
  1. Abra o PR normalmente, seguindo o template padrão.
  2. Adicione um comentário no PR mencionando: “@Vini, preciso de uma segunda opinião neste ponto X (descrição breve)”.
  3. Caso o Vini esteja disponível, ele responderá ao comentário com sugestões. Caso não esteja, aguarde o retorno ou contate outro colega de confiança.

---

### 2. Hotfix (Correção Crítica) ou Demandas Críticas

- **Quando usar**:
  - Falhas graves em produção que exigem correção imediata.
  - Situações em que não há janela para aguardar a revisão completa pelo fluxo tradicional de PR.
  - **Pode ser feito por qualquer desenvolvedor conforme necessidade**

- **Como proceder**:
  1. Comunique imediatamente o time (Slack/Teams) e informe que será realizada uma correção emergencial (HOTFIX).
  2. Crie uma branch a partir da `main` ou `master`, seguindo o padrão `hotfix/<descrição-curta>`.
  3. Realize a alteração mínima necessária para resolver o problema.
  4. No PR de hotfix, inclua na descrição:
     - Menção clara de que se trata de um Hotfix emergencial.
     - Explicação breve do motivo e urgência.
  5. **Não é necessário** cumprir checklist completo (lint, documentação detalhada ou instruções de teste extensivas), mas:
     - Execute pelo menos um teste manual que comprove a correção.
     - Informe no PR como reproduzir localmente a falha original e ver como ficou corrigida.
  6. Marque o Vini (ou outro membro de confiança, se o Vini não estiver disponível) para revisão pós-merge:
     - Assim que o PR for mergeado, peça revisão retroativa para validar que nenhum outro impacto foi causado.

---

### 3. Demandas Simples ou de Baixa Complexidade

- **Quando usar**:
  - Alterações triviais, como correção de texto, mudança de estilo (CSS/Tailwind), ajustes de configuração que não impactam lógica de negócio.
  - Mudanças que não exigem documentação adicional.
  - **Pode ser feito por qualquer desenvolvedor conforme necessidade**

- **Como proceder**:
  1. Avalie se realmente não há risco ou complexidade para justificar uma revisão profunda.
  2. Caso confirme que é algo simples:
     - Crie o PR seguindo o template padrão, mas no checklist basta informar o link do Jira e omitir partes irrelevantes (por exemplo, “Atualizei documentação” pode ficar sem marcações).
     - No corpo do PR, inclua um breve aviso: “Alteração de baixa complexidade, sem necessidade de revisão profunda. @Vini, confirme quick-check se possível.”
  3. Se o Vini estiver disponível, ele pode fazer uma rápida verificação. Se não estiver, utilize bom senso:
     - Após 24 horas sem revisão, sinta-se livre para dar merge, contanto que tenha executado testes básicos.
  4. Caso haja qualquer dúvida posterior, comunique imediatamente no slack.

---

### 4. Vini Indisponível (Férias, Ausência ou Emergência)

- **Quando usar**:
  - O Vini estiver ausente por motivo previamente comunicado (férias, licença médica etc.).
  - Necessidade de subir algo pontual para teste, sem alternativa de aguardar o retorno.

- **Como proceder**:
  1. Verifique na agenda do time ou canal dedicado se há indicação de quem pode assumir temporariamente as revisões.
  2. Caso exista um revisor alternativo definido, envie o PR para ele.
  3. Se não houver revisor alternativo:
     - Utilize bom senso para determinar risco.
     - Caso a mudança seja essencial para testes ou demonstrações, abra o PR e mencione no título: `[URGENTE - SEM REVISOR]`.
     - Realize testes manuais locais robustos.
     - Documente no PR: passos que você seguiu, resultados dos testes e riscos potenciais.
     - Imediatamente após o retorno do Vini, peça revisão retroativa para validar a qualidade do código.

---

### 5. Comunicação Prévia ao Vini

- Em qualquer um dos casos acima, sempre que possível, informe ao Vini antes da ação:
  - Mensagem rápida no canal de comunicação interno (Slack/Teams): “@Vini, estarei subindo x alteração (descrição breve).”
  - Se for HOTFIX, use o prefixo `[HOTFIX]` na mensagem para chamar atenção.
  - Para demandas simples ou urgentes durante ausência, use o prefixo `[EXCEÇÃO]`.

---

### 6. Boas Práticas Gerais

1. **Registro de Exceções**: Mantenha o log de exceções no Jira (ou tag específica) para consultas futuras.
2. **Transparência**: Sempre documente, mesmo que brevemente, o que foi feito e por quê.
3. **Revisão Pós-Merge**: Toda exceção deve ter revisão após o merge, caso o fluxo normal não tenha sido possível.
4. **Melhoria Contínua**: Se perceber que algum tipo de exceção está se tornando frequente, proponha ajustes no processo padrão para abarcar esse caso.

---

Qualquer dúvida ou sugestão sobre esses casos de exceção, entre em contato diretamente comigo (Davi) ou com o Vini!