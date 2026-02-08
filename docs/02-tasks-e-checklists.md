# Tasks e checklists

## b4you-lambdas
### Tasks técnicas
1. Definir endpoints de webhook Stripe com validação de assinatura.
2. Normalizar eventos para o modelo interno (paid, refunded, dispute).
3. Persistir `provider_*` IDs e metadados de rastreio.
4. Emitir eventos internos para atualização de status.
5. Instrumentar logs e métricas específicas de Stripe.
6. Implementar idempotência por `event_id` e janela de reprocessamento.
7. Definir política de rejeição de eventos inválidos e rastrear falhas.
8. Garantir tratamento de eventos fora de ordem (status conflitantes).
9. Persistir e expor `provider` em cada evento (Stripe vs Pagar.me).
10. Garantir reconciliação de estados críticos (paid, refunded, dispute).

### Checklist do MVP
- [ ] Webhook criado para eventos de pagamento.
- [ ] Webhook criado para reembolso.
- [ ] Webhook criado para disputes.
- [ ] Persistência de IDs Stripe.
- [ ] Observabilidade mínima (logs, métricas e alertas).
- [ ] Idempotência validada para reprocessamento de eventos.
- [ ] Rejeição de eventos inválidos auditável.
- [ ] Tratamento de eventos fora de ordem validado.
- [ ] `provider` registrado e auditável nos eventos processados.
- [ ] Regras de reconciliação de estados aplicadas.

### Ordem sugerida
1. Webhooks e validação.
2. Normalização + persistência.
3. Publicação de eventos internos.
4. Observabilidade.

### Dependências
- Contratos de eventos e modelo de dados definidos no api-checkout.

---

## api-checkout
### Tasks técnicas
1. Definir fluxo de criação de pagamento internacional com Stripe.
2. Criar contract de resposta para checkout internacional.
3. Garantir feature flag em endpoints internacionais.
4. Persistir `provider_*` IDs e links de rastreio.
5. Expor status do pagamento conforme eventos recebidos.
6. Definir metadata obrigatória enviada ao Stripe (`transaction_id`, `order_id`, `sale_id`).
7. Garantir separação explícita de rotas nacionais vs. internacionais.
8. Implementar idempotência na criação de intentos (retries do checkout).
9. Definir timestamps relevantes (criação, autorização, captura, falha).
10. Garantir `provider` persistido na transação desde a criação.
11. Definir contrato de resposta que permita identificar provedor no checkout.
12. Validar compatibilidade com o fluxo nacional (sem regressões).

### Checklist do MVP
- [ ] Fluxo internacional definido e isolado.
- [ ] Contrato de API validado com checkout.
- [ ] Feature flag bloqueia acessos não liberados.
- [ ] Rastreabilidade completa via IDs internos.
- [ ] Metadata enviada ao Stripe confirmada nos webhooks.
- [ ] Rotas nacionais preservadas sem regressão.
- [ ] Idempotência de criação validada.
- [ ] Status do pagamento possui timestamps críticos.
- [ ] `provider` persistido e exposto no contrato.
- [ ] Compatibilidade confirmada com o fluxo nacional.

### Ordem sugerida
1. Contrato do fluxo internacional.
2. Criação de pagamentos.
3. Persistência e status.
4. Gate por feature flag.

### Dependências
- Endpoints de webhook e normalização em b4you-lambdas.
- Regras de produto internacional em backoffice.

---

## b4you-checkout (novo checkout)
### Tasks técnicas
1. Definir fluxo UI/UX internacional em EN.
2. Integrar comunicação com api-checkout para Stripe.
3. Exibir status e mensagens compatíveis com pagamentos internacionais.
4. Garantir funcionamento com feature flag.
5. Garantir experiência de erro para eventos de falha e chargeback.
6. Exibir moeda e idioma coerentes com internacional.
7. Exibir estados pós-compra (pending/refunded/dispute) quando aplicável.
8. Definir base compartilhada de UI e i18n para EN/PT.
9. Implementar camada de comunicação com api-checkout reutilizável pelo legado.

### Checklist do MVP
- [ ] Páginas internacionais em EN.
- [ ] Checkout funcional com cartão internacional.
- [ ] Mensagens de sucesso/erro compatíveis.
- [ ] Feature flag funcionando.
- [ ] Mensagens de erro para falhas e chargeback.
- [ ] Moeda e idioma coerentes com internacional.
- [ ] Estados pós-compra disponíveis para consulta.
- [ ] Base de UI/i18n compartilhada com o legado.
- [ ] Cliente de comunicação com api-checkout reutilizável.

### Ordem sugerida
1. UI internacional.
2. Integração com api-checkout.
3. Validações e mensagens.
4. Feature flag.

### Dependências
- Contrato de API definido no api-checkout.

---

## sixbase-checkout (checkout legado)
### Tasks técnicas
1. Identificar produtos internacionais no fluxo existente.
2. Redirecionar para novo checkout internacional quando aplicável.
3. Preservar fluxo nacional.
4. Garantir compatibilidade de parâmetros e tracking existentes.
5. Assegurar que falhas no handoff não quebrem o fluxo nacional.
6. Consolidar componentes e mensagens com o novo checkout.
7. Adotar camada de comunicação com api-checkout compartilhada.

### Checklist do MVP
- [ ] Detecção de produto internacional por flag explícita.
- [ ] Redirecionamento consistente para novo checkout.
- [ ] Fluxo nacional intacto.
- [ ] Parâmetros legados mantidos no handoff.
- [ ] Fallback seguro em caso de falha no redirecionamento.
- [ ] Componentes e mensagens compartilhados com o novo checkout.
- [ ] Comunicação com api-checkout alinhada ao novo checkout.

### Ordem sugerida
1. Identificação do produto internacional.
2. Redirecionamento para novo checkout.
3. Verificação de compatibilidade.

### Dependências
- Feature flag definida no backoffice.

---

## sixbase-dashboard
### Tasks técnicas
1. Exibir transações Stripe com `provider_*` IDs.
2. Exibir status de pagamento e disputas.
3. Relacionar transações a `transaction_id`, `order_id`, `sale_id`.
4. Aplicar feature flag nas visualizações.
5. Exibir histórico básico de eventos Stripe por transação.
6. Exibir status de habilitação internacional para o produtor.
7. Separar listagens e filtros por nacional vs internacional.
8. Implementar métricas segmentadas por provedor (Pagar.me vs Stripe).
9. Garantir que telas nacionais não dependam de dados Stripe.

### Checklist do MVP
- [ ] Visualização de pagamentos internacionais.
- [ ] Exibição de reembolso e disputes.
- [ ] Rastreabilidade com IDs internos.
- [ ] Feature flag aplicada.
- [ ] Histórico de eventos Stripe acessível.
- [ ] Status de habilitação internacional visível ao produtor.
- [ ] Listagens separadas por nacional/internacional.
- [ ] Métricas segmentadas por provedor.
- [ ] Fluxo nacional independente de dados Stripe.

### Ordem sugerida
1. Modelos de dados e endpoints.
2. Exibição de status e IDs.
3. Feature flag em telas.

### Dependências
- api-checkout e backoffice expõem dados necessários.

---

## sixbase-api-backoffice
### Tasks técnicas
1. Criar/ajustar modelos de produto/oferta internacional.
2. Implementar controle de feature flag.
3. Expor endpoints para dashboards e checkouts.
4. Garantir auditoria das mudanças de flag.
5. Expor endpoints de consulta de status internacional por produto/oferta.
6. Expor endpoints de status da feature para consumo pelo dashboard.

### Checklist do MVP
- [ ] Cadastro de produtos/ofertas internacionais.
- [ ] Feature flag operacional.
- [ ] Endpoints para consulta de estado.
- [ ] Auditoria básica habilitada.
- [ ] Consulta de status internacional por produto/oferta disponível.
- [ ] Endpoint de status da feature disponível para dashboard.

### Ordem sugerida
1. Modelo de produto internacional.
2. Feature flag.
3. Endpoints de consulta.
4. Auditoria.

### Dependências
- Consumo pelo checkout e api-checkout.

---

## sixbase-backoffice
### Tasks técnicas
1. Adicionar campos de “internacional” em formulários de produto/oferta.
2. Implementar tela de controle da feature flag Stripe.
3. Exibir histórico básico de alterações (usuário, data, ação).
4. Garantir validações para impedir uso de internacional sem flag.
5. Integrar com endpoints do sixbase-api-backoffice.
6. Indicar claramente que o uso operacional ocorre no dashboard.

### Checklist do MVP
- [ ] Cadastro/edição de produto internacional disponível.
- [ ] Feature flag de Stripe controlável no backoffice.
- [ ] Histórico básico de alterações visível.
- [ ] Validações de internacional aplicadas.
- [ ] Mensagem de governança exibida para usuários internos.

### Ordem sugerida
1. Campos de produto/oferta internacional.
2. Tela de feature flag.
3. Histórico e validações.

### Dependências
- Endpoints expostos pelo sixbase-api-backoffice.
