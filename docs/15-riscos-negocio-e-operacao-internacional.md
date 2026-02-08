# Riscos de negócio e operação — Stripe internacional (MVP)

## Visão geral de risco
O planejamento técnico já define separação de adquirência (Pagar.me nacional / Stripe internacional), webhooks como fonte de verdade e governança central via backoffice. Do ponto de vista de negócio e operação, o MVP é viável **desde que** haja aceitação consciente dos riscos regulatórios, antifraude e logística, além de alinhamento operacional para garantir uma linha única de acompanhamento entre nacional e internacional. O ponto mais sensível é evitar fragmentação operacional e exposição a riscos regulatórios/chargebacks sem estrutura de mitigação adicional.

## Riscos críticos
### 1) Regulatórios e fiscais
- **Caracterização da operação**: ainda que o pagamento seja internacional, o modelo pode ser interpretado como venda internacional dependendo da origem do produto/serviço e do produtor. Isso pode exigir obrigações fiscais adicionais (ex.: emissão, reporte, compliance tributário) que não estão explicitadas no MVP.
- **Disputas e chargebacks internacionais**: maior complexidade e prazos distintos podem impactar fluxo de caixa e suporte, com risco de escalada operacional não prevista.
- **Documentação fora do Brasil**: dependendo do tipo de produto/serviço e da jurisdição do comprador, pode haver exigências de documentação ou registros não contemplados no plano.

### 2) Logística e entrega (frete)
- **Modelo atual baseado em CEP**: não é compatível com endereços internacionais e pode gerar falhas de cálculo de frete, prazos incorretos ou entrega inviável.
- **Produtos físicos internacionais**: alto risco operacional no MVP sem ajustes de logística internacional e políticas de entrega/retorno.
- **Recomendação operacional**: **bloquear produtos físicos internacionais no MVP** para evitar ruptura de entrega e passivos de suporte.

### 3) Antifraude e risco financeiro
- **Konduto**: se a configuração atual está focada em Brasil, pode gerar falso positivo ou baixa efetividade para transações internacionais.
- **Stripe Radar**: não está no escopo; portanto, o MVP pode operar sem antifraude internacional robusto.
- **Impacto**: aumento esperado de chargebacks e fraudes em internacional, especialmente no início.
- **Recomendação operacional**: limitar exposição inicial por governança (ex.: grupos controlados de produtores) e monitorar chargebacks com thresholds de bloqueio manual.

### 4) PIX e recorrência
- **PIX**: como o MVP internacional usa Stripe e o nacional usa Pagar.me, há risco de expectativa indevida de PIX em internacional (inexistente no escopo) e de inconsistência na comunicação com o produtor/consumidor.
- **Recorrência**: ausência de definição explícita sobre recorrência internacional pode gerar conflitos operacionais (ex.: tentativas de vendas recorrentes em produtos internacionais sem suporte adequado no fluxo atual).
- **Recomendação operacional**: explicitar a indisponibilidade de PIX e recorrência no internacional durante o MVP para evitar promessas comerciais e suporte corretivo.

## Riscos moderados
- **Convergência operacional parcial**: separação de visões nacionais e internacionais pode levar a dois processos internos paralelos se não houver alinhamento de atendimento e reporting.
- **Suporte**: necessidade de padronização de linguagem para que suporte e operação atuem sem depender de conhecimento profundo de Stripe.
- **Observabilidade operacional**: dependência de webhooks e rastreabilidade exige disciplina de processos internos para investigação fim-a-fim.
- **Expectativa de meios de pagamento**: risco de comunicação inconsistente sobre disponibilidade de PIX e recorrência entre nacional e internacional.

## Riscos aceitos
- **Ausência de reconciliação financeira avançada**: aceitável no MVP, desde que o risco de divergências pontuais seja assumido pela operação.
- **Experiência inicial em EN**: risco de conversão reduzida para alguns perfis, mas aceitável para testar internacional.
- **Segmentação por provedor**: aceitável no MVP desde que a operação mantenha visão unificada por processos internos.

## Mitigações recomendadas (não estruturais)
- **Governança operacional**: documentação interna clara sobre quando usar Stripe (internacional) e como conduzir suporte e reembolsos, com uma linha única de acompanhamento.
- **Política de produtos físicos**: definir regra explícita de bloqueio no MVP para entregas internacionais até haver logística compatível.
- **Limites operacionais de exposição**: iniciar com grupos controlados de produtores e thresholds para revisão manual de chargebacks.
- **Padronização de linguagem de suporte**: glossário único de estados e processos para nacional e internacional.
- **Plano de monitoramento**: alertas internos para disputa/chargeback acima de limites e para falhas de webhook.
- **Comunicação de meios de pagamento**: deixar explícito para times internos e produtores que PIX e recorrência não estão disponíveis no fluxo internacional do MVP.

## Parecer final de viabilidade do MVP
**VIÁVEL COM RESTRIÇÕES**. O MVP pode seguir para execução **desde que** sejam aceitos conscientemente os riscos regulatórios e de antifraude, e que haja bloqueio de produtos físicos internacionais no MVP para evitar ruptura operacional. Sem essas restrições e alinhamento operacional, o risco de fragmentação e passivo de suporte é alto o suficiente para bloquear o go-live.
