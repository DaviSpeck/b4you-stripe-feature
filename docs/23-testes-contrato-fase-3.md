# Testes de contrato — FASE 3 (definição)

> **Nota**: esta seção define testes em formato automatizado (Gherkin-like), sem implementação.

## Refund nacional (Pagar.me)
```gherkin
Scenario: Refund Pagar.me consolida estado interno
  Given um evento refund com provider "pagarme" e action "request"
  When o evento é processado
  Then o estado interno deve ser "refund_requested"

  Given um evento refund com provider "pagarme" e action "success"
  When o evento é processado
  Then o estado interno deve ser "refund_succeeded"
```

## Refund internacional (Stripe)
```gherkin
Scenario: Refund Stripe consolida estado interno
  Given um evento refund com provider "stripe" e action "request"
  When o evento é processado
  Then o estado interno deve ser "refund_requested"

  Given um evento refund com provider "stripe" e action "success"
  When o evento é processado
  Then o estado interno deve ser "refund_succeeded"
```

## Dispute nacional (Pagar.me)
```gherkin
Scenario: Dispute Pagar.me consolida estado interno
  Given um evento dispute com provider "pagarme" e action "open"
  When o evento é processado
  Then o estado interno deve ser "dispute_open"

  Given um evento dispute com provider "pagarme" e action "won"
  When o evento é processado
  Then o estado interno deve ser "dispute_won"
```

## Dispute internacional (Stripe)
```gherkin
Scenario: Dispute Stripe consolida estado interno
  Given um evento dispute com provider "stripe" e action "open"
  When o evento é processado
  Then o estado interno deve ser "dispute_open"

  Given um evento dispute com provider "stripe" e action "lost"
  When o evento é processado
  Then o estado interno deve ser "dispute_lost"
```

## Eventos fora de ordem
```gherkin
Scenario: Evento success chega antes do request
  Given o estado interno é "refund_requested"
  And um evento refund com action "success" é processado
  Then o estado interno deve ser "refund_succeeded"

Scenario: Evento open chega após dispute final
  Given o estado interno é "dispute_won"
  And um evento dispute com action "open" é processado
  Then o estado interno deve permanecer "dispute_won"
```

## Eventos duplicados
```gherkin
Scenario: Evento duplicado é ignorado
  Given um evento com event_id "evt_123" já foi processado
  When o mesmo evento com event_id "evt_123" é recebido novamente
  Then nenhum estado deve ser alterado
```

## Transição inválida bloqueada
```gherkin
Scenario: Regressão de refund não ocorre
  Given o estado interno é "refund_succeeded"
  When um evento refund com action "request" é processado
  Then o estado interno deve permanecer "refund_succeeded"
```

## Regressão de estado não ocorre
```gherkin
Scenario: Dispute não regrede
  Given o estado interno é "dispute_lost"
  When um evento dispute com action "open" é processado
  Then o estado interno deve permanecer "dispute_lost"
```
