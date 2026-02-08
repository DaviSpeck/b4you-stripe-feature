# Detalhamento — sixbase-backoffice (UI interna)

## Escopo deste complemento
Definir a UI interna do backoffice como camada exclusiva de governança. Nenhuma ação operacional é executada aqui.

## 1) Tela de liberação/bloqueio da feature Stripe
### Campos visíveis
- Estado atual: `disabled`, `enabled`, `suspended`.
- Última alteração (responsável + data).

### Ações permitidas
- Alterar estado da feature com justificativa.

### Feedback visual
- Indicadores claros de estado (ativo, bloqueado, suspenso).

### Auditoria visível
- Histórico de alterações com: quem, quando, estado anterior/posterior, justificativa.

### Alertas para ações críticas
- Confirmação obrigatória para `suspended`/`disabled`.

---

## 2) Tela de produto/oferta internacional
### Campos obrigatórios
- `internacional` (toggle)
- `justificativa`
- `responsável`

### Validações
- Apenas produtos/ofertas válidos podem ser marcados.
- Requer feature Stripe `enabled`.

### Feedback visual
- Indicação clara de internacional ativo/inativo.

### Histórico
- Log de alterações para cada produto/oferta.

---

## 3) Limites explícitos do backoffice UI
- Não configura preços.
- Não configura moedas.
- Não altera UX do checkout.
- Não executa operações financeiras.
- Não permite operação de produtor.

## 4) Mensagem de governança
- UI deve deixar explícito que **operações de produtor são feitas no dashboard**.
