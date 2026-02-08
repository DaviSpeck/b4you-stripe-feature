# Governança e separação de responsabilidades (Backoffice)

## Princípio central
O backoffice é a **camada oficial de governança**. Ele controla **se e quando** a Stripe pode ser utilizada e **não opera** a estrutura do produtor.

## Governança da feature Stripe
- **Backoffice**: habilita, suspende e bloqueia.
- **Dashboard**: opera a estrutura do produtor quando habilitada.
- **Checkout**: apenas consome a decisão de governança.

## Separação absoluta de responsabilidades
### Backoffice (sixbase-api-backoffice + sixbase-backoffice)
- Liberação/bloqueio da feature Stripe.
- Marcação de produto/oferta como internacional.
- Auditoria completa de alterações.

### Dashboard (sixbase-dashboard + sixbase-api)
- Operação do produtor (gestão e visibilidade de transações).
- Exibição de status, refunds e disputes.

### Checkout (b4you-checkout + sixbase-checkout)
- Execução do pagamento.
- Exibição de estados ao usuário final.

### Lambdas (b4you-lambdas)
- Processamento de webhooks.
- Atualização do estado interno.

## Limites absolutos do backoffice (MVP)
- Não executa operações financeiras.
- Não processa pagamentos.
- Não define regras operacionais.
- Não expõe configurações de checkout.
- Não executa ações do produtor.

## Contratos e governança
- O backoffice fornece **estado e permissão**.
- Nenhum parâmetro operacional é configurado no backoffice.
- Alterações são auditadas e propagadas por leitura.

## Pontos documentados para evolução futura
- Ampliação de observabilidade da governança.
- Regras avançadas de consistência multi-serviço.
