# Detalhamento — sixbase-api-backoffice (API de governança)

## Escopo deste complemento
Definir contratos e regras de governança expostos pelo backoffice. O backoffice **apenas libera, bloqueia e audita**. Não executa operações financeiras nem configura regras de pagamento.

## 1) Governança da feature Stripe
### Quem pode habilitar/desabilitar
- Apenas usuários internos autorizados da B4You.
- Permissões internas obrigatórias: **governança de pagamentos** e **administração de feature flags**.

### Estados possíveis da feature
- `disabled`: Stripe bloqueada para uso.
- `enabled`: Stripe liberada para uso.
- `suspended`: Stripe bloqueada temporariamente por governança.

### Fluxo de ativação/desativação
1. Usuário interno altera estado da feature no backoffice.
2. Estado é persistido e auditado.
3. Estado é exposto via API para consumo por api-checkout e dashboard.

### Impacto imediato nos demais sistemas
- **api-checkout** passa a permitir/bloquear criação de pagamentos internacionais.
- **dashboard** passa a exibir/ocultar capacidades internacionais conforme estado.
- **checkout** consome a flag apenas para leitura.

### Auditoria obrigatória
- Campos mínimos: `quem`, `quando`, `o que`, `estado anterior`, `estado posterior`, `justificativa`.

### Limites explícitos
- O backoffice **não** executa operações financeiras.
- O backoffice **não** configura regras de pagamento.

---

## 2) Produtos e ofertas internacionais (governança)
### Marcação de internacional
- Produto/oferta só pode ser marcado como internacional por usuário interno autorizado.
- O status internacional é **explícito** e persistido.

### Validações obrigatórias
- Produto/oferta deve estar ativo e válido no catálogo.
- Feature Stripe deve estar `enabled` para permitir marcação.
- Campos mínimos de governança preenchidos (responsável, justificativa).

### Campos mínimos de governança
- `internacional = true/false`
- `motivo` / justificativa
- `responsável`
- `data da mudança`

### Regras para impedir conversão indevida
- Produtos nacionais não podem ser convertidos automaticamente.
- Conversão exige ação explícita e auditoria.

### Edição de produto internacional já ativo
- Alterações são auditadas e não alteram estados operacionais.
- O backoffice não muda preço, moeda ou UX.

### Rollback ou bloqueio
- Permitir reversão de `internacional = false` por governança.
- Bloqueio imediato do uso internacional quando requerido.

### Limites explícitos
- Backoffice **não** gerencia preços, moedas ou checkout.
- Backoffice **não** define comportamento de UX.

---

## 3) Contratos expostos pelo backoffice
### Endpoints principais (leitura)
- **Estado da feature Stripe**
- **Status internacional do produto/oferta**
- **Histórico/auditoria de alterações**

### Contrato canônico para consumo no checkout legado
- `international_checkout` (objeto):
  - `is_international` (bool)
  - `feature_enabled` (bool)
  - `provider` (string, ex.: `stripe`)
  - `checkout_url` (string, base URL do checkout internacional)

### Consumo por serviços
- **api-checkout**: lê estado da feature e status internacional.
- **sixbase-dashboard**: lê estado da feature e status internacional para visualização.

### Consistência e versionamento
- Respostas versionadas por schema.
- Campos mínimos garantidos: `feature_state`, `internacional`, `updated_at`.

### Leitura segura
- Endpoints somente leitura para serviços consumidores.
- Cache controlado para evitar inconsistência.

### O que o backoffice NÃO expõe no MVP
- Parâmetros operacionais de pagamento.
- Configurações de checkout ou UX.
- Dados financeiros.

---

## 4) Feature flag e propagação
### Persistência
- Persistida em repositório interno de feature flags do backoffice.

### Propagação
- API do backoffice serve como fonte de leitura para api-checkout e dashboard.
- Sem controle direto pelo dashboard ou checkout.

### Evitar inconsistência
- Cache com TTL curto ou invalidação por alteração.
- Último estado prevalece, auditado.

### Comportamento quando a flag muda
- Mudança reflete imediatamente em novas operações internacionais.
- Operações já iniciadas não são alteradas retroativamente.

### Rollback rápido
- Alteração direta para `suspended` ou `disabled` com auditoria.

### Limites explícitos
- Dashboard consome a flag, mas **não** controla.
- Checkout consome a flag, mas **não** controla.

---

## 5) Limites absolutos do backoffice (API)
- Não processa pagamentos.
- Não atualiza status de transações.
- Não define regras operacionais.
- Não expõe dados financeiros.

## 6) Responsabilidades fora do backoffice
- **Dashboard**: operação e gestão do produtor.
- **Checkout**: execução da compra.
- **Lambdas**: processamento de webhooks.
