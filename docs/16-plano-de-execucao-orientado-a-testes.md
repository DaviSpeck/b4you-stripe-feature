# Plano de execução orientado a testes — Stripe MVP

## Visão geral da estratégia
A execução ocorrerá em fases incrementais e independentes. Cada fase possui critérios objetivos de validação e de bloqueio, garantindo avanço apenas quando os testes indicarem estabilidade. O foco é reduzir risco, permitir correções locais e evitar refatorações globais, sem reabrir decisões arquiteturais ou alterar o escopo do MVP.

### Princípios de execução segura
- Implementar e validar em partes pequenas, com checkpoints claros.
- A cada fase, confirmar que o fluxo nacional não foi impactado.
- Usar testes manuais e de contrato com casos de falha definidos.
- Interromper e ajustar quando critérios de bloqueio forem atingidos.

## Fases de execução

### FASE 1 — Fundamentação (sem frontend)
**O que está sendo implementado**
- Criação de pagamento internacional (Stripe).
- Persistência de `provider_*` IDs.
- Metadata obrigatória (`transaction_id`, `order_id`, `sale_id`).
- Idempotência de criação.
- Isolamento total do fluxo nacional.

**Como testar**
- **Teste manual**: criar pagamentos internacionais com dados válidos e verificar retorno de IDs e metadata.
- **Teste de contrato**: validar esquema de request/response para criação (campos obrigatórios e tipos).
- **Casos de falha**: payload sem metadata obrigatória, requisição duplicada, falha de autenticação, moeda inválida.

**O que valida sucesso**
- Pagamentos internacionais criados com `provider_*` IDs persistidos.
- Metadata obrigatória presente e correta em todas as criações.
- Requisições idempotentes não criam duplicidade.
- Fluxo nacional permanece inalterado e não recebe chamadas do novo fluxo.

**O que invalida e exige ajuste**
- Ausência de IDs persistidos ou metadata incompleta.
- Duplicidade em criação idempotente.
- Qualquer interação com o fluxo nacional.
- Erros de contrato (campos faltando, tipos inválidos).

---

### FASE 2 — Checkout internacional (grafo transacional) + Webhooks
**Status:** ✔️ CONCLUÍDA · ✔️ GATE DE TESTES SATISFEITO
**FASE 2A — Grafo transacional no checkout internacional**
**O que está sendo implementado**
- Criação de `sales`, `sales_items`, `charges`, `transactions` e relacionamentos no checkout internacional.
- Status inicial pendente (espelhando Pix/Boleto/Cartão Pagar.me).
- `provider = stripe` e `provider_id = payment_intent.id` nas entidades de pagamento.
- Nenhuma alteração no fluxo nacional.

**Como testar**
- **Teste automatizado**: validar criação dos registros e relacionamentos.
- **Teste de contrato**: validar campos obrigatórios no payload internacional.
- **Cenários de idempotência**: mesma `transaction_id` não duplica grafo.
- **Teste de regressão**: fluxo nacional continua inalterado.

**O que valida sucesso**
- Grafo transacional criado em estado pendente.
- `provider`/`provider_id` persistidos corretamente.
- Idempotência preservada na criação de intentos.
- Fluxo nacional inalterado.

**O que invalida e exige ajuste**
- Ausência de qualquer entidade do grafo transacional.
- Status inicial diferente de pendente.
- `provider`/`provider_id` ausentes ou incorretos.
- Qualquer impacto no fluxo nacional.

**FASE 2B — Webhooks e consolidação de estado**
**O que está sendo implementado**
- Recebimento de webhooks Stripe.
- Validação de assinatura.
- Deduplicação por `event_id`.
- Processamento de eventos fora de ordem.
- Atualização correta de status interno.
- Reprocessamento seguro.

**Como testar**
- **Teste manual**: enviar eventos simulados com assinatura válida e inválida.
- **Teste de contrato**: validar schema de eventos recebidos e campos obrigatórios.
- **Cenários de replay**: reenviar o mesmo `event_id`.
- **Cenários de atraso**: processar eventos fora de ordem.
- **Cenários de falha parcial**: simular indisponibilidade de persistência e reprocessar.

**O que valida sucesso**
- Eventos válidos são aceitos e atualizam estado interno corretamente.
- Assinaturas inválidas são rejeitadas.
- Duplicações por `event_id` não causam alterações adicionais.
- Eventos fora de ordem são conciliados sem regressão de estado.
- Reprocessamento é seguro e idempotente.

**O que invalida e exige ajuste**
- Falha na validação de assinatura.
- Duplicidade de atualização por replay.
- Estado interno inconsistente após eventos fora de ordem.
- Impossibilidade de reprocessar com segurança.

---

### FASE 3 — Convergência operacional
**Status:** ✔️ CONCLUÍDA · ✔️ GATE DE TESTES SATISFEITO
**O que está sendo implementado**
- Estados internos unificados (nacional vs internacional).
- Reembolso.
- Chargeback / dispute.
- Histórico de eventos.
- Rastreabilidade ponta a ponta.

**Como testar**
- **Teste manual**: executar fluxos equivalentes nacional e internacional e comparar estados.
- **Teste de contrato**: validar campos de status internos e histórico de eventos.
- **Casos de falha**: disputa iniciada sem referência completa, reembolso parcial inválido, inconsistência de estados.
- **Comparação conceitual**: mapear estados Pagar.me x Stripe e validar semântica.

**O que valida sucesso**
- Estados internos representam corretamente ambos os provedores.
- Reembolso e dispute são refletidos no histórico e status.
- Rastreabilidade garante vínculo entre eventos, transação e sale.
- Semântica de status consistente entre nacional e internacional.

**O que invalida e exige ajuste**
- Divergência de semântica de status entre provedores.
- Falhas de rastreabilidade ou histórico incompleto.
- Operações de reembolso/dispute gerando estado incoerente.

---

### FASE 4 — Checkout (novo)
**O que está sendo implementado**
- Fluxo internacional completo em EN.
- Estados exibidos (pending, approved, failed).
- Comportamento sem webhook recebido.
- Falhas de autorização.
- Retry controlado.
- Garantia de não impacto no fluxo nacional.

**Como testar**
- **Teste manual**: checkout internacional em ambiente de testes com diferentes status.
- **Teste de contrato**: validar payloads de criação e retorno exibido ao usuário.
- **Casos de falha**: ausência de webhook, autorização negada, retry excedido.

**O que valida sucesso**
- Fluxo internacional apresenta estados corretos ao usuário.
- Sem webhook, estado permanece em pending com lógica segura.
- Falhas de autorização retornam feedback correto.
- Retry controlado sem duplicidade de pagamento.
- Fluxo nacional não é impactado.

**O que invalida e exige ajuste**
- Estado exibido divergente do status interno.
- Retry causando duplicidade.
- Qualquer impacto no fluxo nacional.

---

### FASE 5 — Checkout legado (handoff)
**O que está sendo implementado**
- Identificação correta de produto internacional.
- Redirecionamento seguro.
- Preservação de parâmetros.
- Fallback para fluxo nacional.
- Métricas e tracking preservados.

**Como testar**
- **Teste manual**: simular produto internacional e verificar redirecionamento.
- **Teste de contrato**: validar parâmetros preservados.
- **Casos de falha**: produto não identificado, falha no redirecionamento.

**O que valida sucesso**
- Produtos internacionais redirecionam corretamente.
- Parâmetros e tracking preservados.
- Fallback funciona para produto nacional.

**O que invalida e exige ajuste**
- Redirecionamento incorreto ou inseguro.
- Perda de parâmetros críticos ou métricas.
- Falha no fallback.

---

### FASE 6 — Dashboard
**O que está sendo implementado**
- Visualização de pagamentos internacionais.
- Status coerente com eventos.
- Reembolsos e disputes.
- Separação visual nacional vs internacional.
- Linha única de acompanhamento operacional.

**Como testar**
- **Teste manual**: validar listagens e detalhes de pagamentos internacionais.
- **Teste de contrato**: validar schema de status exibidos.
- **Casos de falha**: status inconsistente com histórico, disputa não exibida.

**O que valida sucesso**
- Pagamentos internacionais visíveis e distinguíveis.
- Status coerente com histórico e eventos.
- Reembolsos e disputes refletidos corretamente.

**O que invalida e exige ajuste**
- Status divergentes do histórico.
- Ausência de visibilidade para disputas/reembolsos.
- Separação visual inadequada.

---

### FASE 7 — Backoffice e governança
**O que está sendo implementado**
- Liberação e bloqueio via feature flag.
- Propagação correta da flag.
- Auditoria.
- Garantia de que nenhuma ação operacional ocorre no backoffice.

**Como testar**
- **Teste manual**: alternar feature flag e observar impacto no fluxo internacional.
- **Teste de contrato**: validar eventos de auditoria e logs de decisão.
- **Casos de falha**: flag inconsistente entre sistemas, auditoria incompleta.

**O que valida sucesso**
- Feature flag controla liberação e bloqueio corretamente.
- Propagação consistente entre sistemas.
- Auditoria registra decisões relevantes.
- Backoffice não executa ações operacionais.

**O que invalida e exige ajuste**
- Flag com propagação inconsistente.
- Auditoria ausente ou incompleta.
- Qualquer ação operacional indevida no backoffice.

---

## Pontos transversais (aplicáveis a todas as fases)

### Validação do fluxo nacional não impactado
- Executar teste de regressão rápido no fluxo nacional ao fim de cada fase.
- Verificar ausência de chamadas ao provedor internacional no fluxo nacional.
- Confirmar métricas estáveis e sem regressão de conversão.

### Logs obrigatórios para diagnóstico
- Registro de criação de pagamento internacional com IDs e metadata.
- Registro de recebimento de webhook com `event_id`.
- Registro de decisão de idempotência.
- Registro de transição de status interno.

### Métricas mínimas a observar
- Taxa de criação bem-sucedida (internacional).
- Taxa de falha por validação de assinatura.
- Quantidade de eventos duplicados rejeitados.
- Tempo médio entre criação e confirmação de status.

### Critérios claros de rollback
- Falha de idempotência detectada.
- Estado inconsistente com eventos.
- Impacto comprovado no fluxo nacional.
- Erros críticos em produção sem mitigação imediata.

### Sinais de alerta para interromper execução
- Aumento súbito de erros de criação internacional.
- Divergência entre status exibido e status interno.
- Webhooks com falha recorrente de validação.
- Qualquer evidência de impacto no fluxo nacional.

## Critérios de avanço
- Todos os critérios de sucesso da fase atual atendidos.
- Fluxo nacional validado como não impactado.
- Métricas dentro de limites esperados.
- Ausência de sinais de alerta críticos.

## Critérios de bloqueio
- Qualquer critério de falha da fase atual.
- Regressão no fluxo nacional.
- Inconsistências de estado ou rastreabilidade.
- Falhas recorrentes sem mitigação local.

## Observações finais de execução segura
- Validar incrementalmente e registrar evidências de testes.
- Não avançar sem estabilidade comprovada.
- Priorizar correções locais e evitar refatorações amplas.
- Manter rastreabilidade e auditoria desde o início do ciclo.
