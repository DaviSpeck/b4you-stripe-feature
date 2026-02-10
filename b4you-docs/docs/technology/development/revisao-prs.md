---
title: Fluxo de Revisão de PRs
---

# Fluxo de Revisão de PRs

A partir de hoje (03/06/2025), teremos uma nova estratégia de revisão de Pull Requests (PRs). O Vini será o responsável pelas revisões diárias e, para que tudo funcione de maneira organizada, seguem as orientações que devem ser seguidas por **todos os desenvolvedores** (responsáveis por executar as demandas):

---

### 1. Guia de Execução de Demandas para Desenvolvedores
1. **Antes de abrir o PR, confira o Jira**  
   - O card no Jira deve conter:  
     - Descrição clara da demanda (escopo, requisitos, critérios de aceite) - responsabilidade hoje do Leonardo Ferreira.  
     - Checklist de tarefas concluídas (por exemplo, subtarefas ou pontos de teste) ou evidência clara do que foi produzido.  
     - Instruções de **Como testar** (passo a passo para rodar localmente, comandos necessários, scripts etc.).  

2. **Documentação das demandas que exigem documentação**  
   - Se a funcionalidade/bug exige documentação adicional (novo endpoint, mudança de fluxo de usuário, atualização de arquitetura), crie uma documentação a ser inserida em "https://docs.b4you.com.br" na seção "Documentos Avulsos".  
   - Toda documentação relevante deve ficar disponível em:  
     ```
     https://docs.b4you.com.br
     ```

---

### 2. Padrão de descrição para Pull Requests
Para todo PR aberto, **é obrigatório** utilizar o template abaixo na descrição. Isso facilita a vida do Vini e acelera o processo de revisão:

```markdown
<!-- Descrição breve do que foi alterado e motivo -->

**Tipo de alteração**
- [ ] feat: nova funcionalidade
- [ ] fix: correção de bug
- [ ] docs: documentação
- [ ] refactor: refatoração
- [ ] chore: manutenção

**Checklist**
- [ ] Código passou no lint sem erros
- [ ] Revisão de lógica e segurança concluída
- [ ] Link para issue/tarefa correspondente
- [ ] Atualizei documentação relacionada
- [ ] (Opcional) Adicionei screenshots ou gravações de UI/UX

**Como testar**
1. Descreva passo a passo para reproduzir localmente.
2. Indique comandos ou scripts necessários.

**Observações**
<!-- Informações adicionais, decisões de design, dependências, etc. -->
```

- **Importante**:  
  - Se algum item dos critérios de aceite não estiver sendo atendido, **não** aproxime a abertura do PR; finalize tudo antes.  
  - Caso falte documentação ou instruções de teste, o Vini irá marcar como `Changes requested` até a correção.

---

### 3. Responsabilidades do desenvolvedor após abrir o PR
1. **Acompanhar o status do PR**  
   - Verifique periodicamente os comentários deixados pelo revisor (Vini).  
   - Assim que receber um comentário informando algo impeditivo para o merge, faça a correção o mais rápido possível e responda no próprio PR.  
2. **Implementar ajustes solicitados**  
   - Se o comentário for uma sugestão de melhoria não bloqueante, avalie e, se concordar, faça a atualização em uma branch separada ou no mesmo PR (conforme combinado no comentário).  
   - Caso não concorde, responda o comentário explicando o motivo e abra um ponto para discutirmos se necessário.  
3. **Finalizar checklist**  
   - Antes de solicitar aprovação, confirme que todos os itens do critério de aceite realmente estão sendo atendidos.

---

### 4. Comunicações gerais
- **O Vini está responsável pelas revisões a partir de hoje.**  
- Siga sempre o **Guia de Execução de Demandas para Desenvolvedores** adaptando conforme sua realidade (disponível em https://docs.b4you.com.br).  
- **Se precisar adicionar algum template ou ajuste no Jira**, fale diretamente com o Leonardo Ferreira antes de iniciar o desenvolvimento.  
- **Qualquer dúvida sobre o fluxo de PRs ou templates**, pode me chamar no privado.

---

Obrigado a todos pelo apoio nessa fase de reestruturação do modelo de trabalho da equipe, qualquer sugestão ou melhoria que pensar, é só entrar em contato!

*Lembrando que o propósito aqui é melhorar o dia a dia de todos, nada parte do 8 para o 80 de uma hora para a outra, mas se todos colaborarem e realmente concordarem com os ganhos em cada ação, tudo ficará cada vez melhor.