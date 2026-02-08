# Detalhamento — checkouts (novo e legado)

## Escopo deste complemento
Definir o comportamento operacional dos checkouts novo e legado com foco em fluxo internacional via Stripe, mantendo o nacional intacto e compartilhando base de UI/i18n.

## Momento exato de início do pagamento
- O pagamento é iniciado **no clique de confirmação do usuário** no checkout.
- O checkout chama a api-checkout para criação do pagamento (internacional ou nacional).

## Estados exibidos ao usuário
- **Pendente**: aguardando confirmação via webhook.
- **Aprovado**: confirmado após webhook processado.
- **Falha**: erro definitivo (ex.: autorização recusada).
- **Reembolsado/Disputa**: estados informativos pós-compra.

## Comportamentos específicos
### Falha de autorização
- Exibir mensagem clara de falha e permitir nova tentativa.

### Cartão recusado
- Exibir mensagem de recusa e permitir nova tentativa.

### 3DS (quando aplicável)
- Exibir fluxo de autenticação e aguardar conclusão.
- Persistir estado pendente até confirmação via webhook.

## Estratégia de retry no frontend
- Retries controlados pela UI sem criar duplicidade (idempotência garantida na api-checkout).
- Exibir status de processamento para evitar múltiplos envios simultâneos.

## Enquanto o webhook não chegou
- Checkout mantém estado **pendente**.
- Nenhum “aprovado” é exibido sem webhook.
- A página pode instruir o usuário a aguardar confirmação.

## Diferenças entre checkout novo e legado
- **Novo (b4you-checkout)**: foco em fluxo internacional, UI moderna, i18n EN/PT.
- **Legado (sixbase-checkout)**: preserva experiência nacional e redireciona para fluxo internacional quando necessário.
- Ambos compartilham **base de UI/i18n** e **cliente de comunicação com api-checkout**.

## Pontos de fallback seguro
- Falhas no handoff para internacional devem cair no fluxo nacional sem quebrar a compra.
- URLs e parâmetros legados são preservados.

## O que o checkout NÃO faz no MVP
- Não confirma pagamento sem webhook.
- Não realiza polling.
- Não executa reconciliação ou split.
- Não altera regras do checkout nacional.
