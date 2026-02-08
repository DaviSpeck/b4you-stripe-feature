# Riscos e pontos de atenção

## Riscos técnicos
- Falhas na validação de assinatura de webhook podem comprometer integridade do estado.
- Inconsistências de mapeamento entre eventos Stripe e estados internos.
- Dependências cruzadas entre serviços com feature flag inconsistente.

## Riscos operacionais
- Atraso no processamento de webhooks em picos de tráfego.
- Falta de monitoramento específico para eventos críticos.
- Processos de suporte sem visibilidade de `provider_*` IDs.

## Riscos de negócio
- Experiência internacional inconsistente se fluxo EN não estiver completo.
- Falta de clareza na separação de produtos internacionais pode gerar erros de cobrança.
- Percepção negativa caso chargebacks não apareçam no dashboard.

## Pontos que exigem decisão futura
- Estratégia de expansão para outras moedas/países após MVP.
- Regras de reconciliação financeira em cenários complexos.
- Evolução de observabilidade (ex.: alertas avançados).
