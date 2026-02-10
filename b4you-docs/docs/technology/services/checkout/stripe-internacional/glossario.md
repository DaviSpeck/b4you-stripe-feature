---
title: Stripe Internacional na B4You — Glossário Expandido
---

# Stripe Internacional na B4You — Glossário Expandido

## 12) Glossário

### Adquirente (Acquirer)
Entidade responsável por processar transações junto à rede de pagamento e conectar o lojista/ecossistema à cadeia financeira.

### Issuer (Emissor)
Instituição emissora do cartão do comprador. É quem participa da autorização da transação do ponto de vista do meio de pagamento.

### Processor
Camada/serviço responsável pelo processamento técnico de eventos e transações, conectando participantes da cadeia de pagamento.

### Feature flag
Mecanismo de habilitação controlada de funcionalidade. Nesta iniciativa, é o instrumento formal para permitir ou bloquear operação internacional.

### Fail-safe
Política de segurança operacional aplicada quando não há confiança suficiente para decisão de runtime. O comportamento esperado é bloqueio seguro e auditável.

### Estado interno
Representação canônica persistida pela B4You para uso por frontend, operação e pós-venda. É o contrato oficial de status no ecossistema.

### Pós-venda
Conjunto de processos após tentativa de pagamento, incluindo confirmação de status, refund e dispute no escopo aplicável.

### Webhook
Evento assíncrono emitido pelo provedor para informar mudança de status. No internacional, é parte essencial da convergência de estado.

### Governança de habilitação
Conjunto de regras, controles e fonte de verdade que determina se o fluxo internacional pode operar em produção.

### Idempotência
Propriedade que garante que o mesmo evento/comando processado mais de uma vez não gere efeitos duplicados indevidos.

### Deduplicação de evento
Processo de detectar e ignorar eventos repetidos para evitar regressão de estado e inconsistência operacional.

### Não regressão de estado
Regra que impede transições inválidas de volta para estados anteriores já consolidados como finais.
