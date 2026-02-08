# Riscos e pontos de atenção

## Riscos técnicos
- Falhas na validação de assinatura de webhook podem comprometer integridade do estado.
- Inconsistências de mapeamento entre eventos Stripe e estados internos.
- Dependências cruzadas entre serviços com feature flag inconsistente.
- Falha de idempotência pode duplicar eventos e gerar estados inválidos.
- Eventos fora de ordem podem causar estado final incorreto.
- Falhas de identificação do provedor podem gerar conciliação incorreta.
- Divergência entre UI e i18n nos checkouts pode gerar duplicação de manutenção.

## Riscos operacionais
- Atraso no processamento de webhooks em picos de tráfego.
- Falta de monitoramento específico para eventos críticos.
- Processos de suporte sem visibilidade de `provider_*` IDs.
- Configuração incorreta no backoffice pode expor Stripe indevidamente.
- Confusão de governança entre dashboard e backoffice pode gerar operações indevidas.
- Falta de consistência na separação Pagar.me vs Stripe pode impactar suporte.

## Riscos de negócio
- Experiência internacional inconsistente se fluxo EN não estiver completo.
- Falta de clareza na separação de produtos internacionais pode gerar erros de cobrança.
- Percepção negativa caso chargebacks não apareçam no dashboard.
- Operação manual de reembolso sem rastreabilidade pode gerar inconsistência.

## Pontos que exigem decisão futura
- Estratégia de expansão para outras moedas/países após MVP.
- Regras de reconciliação financeira em cenários complexos.
- Evolução de observabilidade (ex.: alertas avançados).
- Política de retenção de eventos e histórico no dashboard/backoffice.
