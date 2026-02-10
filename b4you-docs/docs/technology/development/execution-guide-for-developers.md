---
title: Guia de Execução de Demandas para Desenvolvedores
---

# Guia de Execução de Demandas para Desenvolvedores

Este guia unifica o **fluxo de trabalho**, o **template de documentação avulsa** e o **template de Pull Request**, garantindo que todas as etapas sejam seguidas de forma padronizada.

---

## 1. Preparação

- **Receba a demanda** criada pelo Head de Tecnologia no Jira/GitHub.  
- **Verifique** que a User Story, Critérios de Aceite e Requisitos estão completos.  
- Se faltar algo, **interrompa** e solicite esclarecimento antes de seguir.

---

## 2. Planejamento

1. **Criar branch (Gitflow)**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<ID>-<descrição-kebab>
   ```
2. **Checklist de Tarefas**
   - Baseie-se nos **Requisitos** e **Funcionalidades Requeridas**.
   - Quebre em passos atômicos, por exemplo:
     - Criar migrações
     - Implementar endpoint `/orders`
     - Ajustar componente React de checkout
     - Configurar CORS e variáveis de ambiente

---

## 3. Documentação Avulsa

Antes de iniciar a implementação, cole no corpo do ticket este template preenchido:

```markdown
---
title: [Título da Demanda]
---

# [Título da Demanda]

## Descrição
Explique o **objetivo** e contexto (por que desta feature ou correção).

## Requisitos
- [ ] Descrever requisitos funcionais
- [ ] Listar critérios de aceite no formato DADO/QUANDO/ENTÃO

## Solução Proposta
Descreva a abordagem técnica: endpoints, componentes, fluxos, integrações.

## Como Testar
1. Passo a passo para validar localmente.  
2. Links/comandos para homologação (se aplicável).

## Observações
- Decisões de design, riscos ou dependências.
```

Em seguida, crie o arquivo em  
```
docs/04-documentos-avulsos/[título-da-demanda-em-kebab].md
```
e faça commit.

---

## 4. Implementação & Testes

- **Commits atômicos** seguindo **Conventional Commits**:
  ```bash
  git commit -m "feat(checkout): adicionar split de pagamento"
  git commit -m "fix(api): corrigir cálculo de imposto"
  ```
- **Testes Manuais**
  Para cada Critério de Aceite, crie cenários de teste:
  - **Fluxo Principal (sucesso)**
  - **Fluxo Alternativo (input inválido)**
  - **Fluxo de Falha (erro externo)**
- **Documente resultados** no ticket, indicando quais critérios foram atendidos.

---

## 5. Pull Request

Abra o PR para `develop` usando este template:

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

- Inclua a **User Story** e os **Critérios de Aceite** no corpo do PR.
- Marque revisores de Front-end, Back-end e de Negócio.

---

## 6. Conclusão

1. Merge aprovado em `develop`.  
2. Tagueie e faça merge em `main` para release (Gitflow).  
3. Deploy automático via CI/CD em homologação e produção.  
4. Comente no ticket quais critérios foram validados e qual release entrega a demanda.

> ⚠️ Se surgir qualquer bloqueio, registre no ticket e aguarde até ser resolvido antes de prosseguir.  