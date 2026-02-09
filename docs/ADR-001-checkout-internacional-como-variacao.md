# ADR-001 — Checkout internacional como variação do checkout existente

## Contexto e problema
O checkout nacional opera com dois modelos consolidados (padrão e 3 etapas), que compartilham contratos, semântica de estados, pós-venda (delivery/thank-you), governança e observabilidade, divergindo apenas em UX/orquestração. A FASE 4 introduziu um fluxo internacional isolado, funcional e testável, porém configurado como uma terceira “família” de checkout. Essa bifurcação tende a elevar o custo de manutenção, a complexidade operacional e o risco de divergência de UX.

Ao mesmo tempo, a FASE 4 tem requisitos rígidos de testabilidade local (sem Stripe real e sem webhooks reais), além de governança centralizada e isolamento do fluxo nacional.

## Decisão
O checkout internacional **passa a evoluir como uma VARIAÇÃO explícita do checkout existente** (padrão/3 etapas), e **não** como uma terceira família permanente.

### Pilares obrigatoriamente compartilhados
- **Semântica de estados internos** (`pending`, `approved`, `failed`, `refunded`, `dispute`).
- **Pós-venda** (delivery/thank-you) baseado em estado interno consolidado.
- **Governança** (feature flag com backoffice como fonte de verdade e fail-safe).
- **Observabilidade** (IDs internos e correlação operacional para CS).

### Elementos que podem variar legitimamente
- Idioma.
- UX e orquestração (padrão/3 etapas).
- Gating por feature flag.
- Mensagens e comportamentos específicos de `pending`/retry, mantendo idempotência e sem confirmação sem webhook.

## Alternativas consideradas
1. **Checkout internacional isolado (terceira família)**
   - **Pró:** velocidade inicial e isolamento técnico.
   - **Contra:** bifurcação estrutural, duplicação de UX e governança, maior custo cognitivo.

2. **Checkout internacional como variação do checkout existente (decisão atual)**
   - **Pró:** convergência de modelo mental, menor dívida estrutural, governança e observabilidade unificadas.
   - **Contra:** demanda estratégia de adaptação progressiva para evitar impacto no nacional.

## Justificativa
- **Técnica:** reduz duplicação de regras de estado, pós-venda e observabilidade, evitando inconsistências futuras.
- **UX:** preserva um modelo mental único para produtor e usuário final, com variações apenas na apresentação.
- **Governança:** mantém a feature flag e os contratos centralizados e auditáveis.
- **Testabilidade:** reduz superfície de testes duplicados e mantém cobertura determinística sem dependências externas.

## Consequências
### Positivas
- Eliminação de bifurcação estrutural no médio prazo.
- Redução de custo cognitivo para CS, produto e engenharia.
- Evolução mais previsível e governável.

### Negativas
- Necessidade de convergência incremental para evitar regressões no fluxo nacional.
- Manutenção temporária do fluxo internacional atual até a convergência estar completa.

## Decisões explícitas do que NÃO será feito
- **Não** criar uma terceira família permanente de checkout internacional.
- **Não** alterar contratos existentes de estados internos.
- **Não** introduzir dependência direta de Stripe no frontend.
- **Não** impactar o fluxo nacional durante a convergência.

