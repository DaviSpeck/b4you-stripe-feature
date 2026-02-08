# Analytics Checkout — Jornada e Dashboard (Tracking de Implementação)

## Visão geral
A página **Analytics Checkout** foi evoluída para manter o Dashboard atual e adicionar a visualização **Jornada** dentro da mesma rota. A navegação ocorre via **abas internas** e não cria rotas novas. O objetivo é permitir leitura clara do funil de eventos, progressão por etapas, segmentações e sessões do checkout.

## Estrutura de navegação
A página agora possui múltiplas abas no topo, todas dentro da rota existente:

- **Dashboard**: mantém integralmente o conteúdo e comportamento já existentes.
- **Jornada – Visão geral**: visão agregada com cards, funil, gráficos e matriz de etapas.
- **Jornada – Detalhamento**: tabelas de agrupamento por tipo/modo/método/produto/produtor com paginação.
- **Jornada – Sessões**: linha do tempo por sessão com paginação dedicada.

Essa divisão evita duplicidade de abas internas e distribui o conteúdo para leitura mais harmônica.

## Filtros da Jornada
A Jornada reaproveita o padrão visual de filtros do Dashboard, porém com critérios aderentes aos eventos:

- Intervalo de datas (obrigatório)
- Produtor
- Produto
- Tipo de checkout
- Modo de checkout
- Método de pagamento
- Ambiente (execution_environment)
- Sessões com checkout concluído
- Sessões com erro

Filtros de status/região/estado não são exibidos na Jornada.
Ao alterar filtros, as páginas de produto, produtor e sessões são reiniciadas para manter consistência da leitura.

## Organização de código
A implementação foi organizada em módulos para facilitar manutenção e futura integração:

```
src/views/checkout_analytics/
├── CheckoutAnalytics.tsx
├── README.md
├── tabs/
│   ├── DashboardTab.tsx
│   └── JourneyTab.tsx
├── components/
│   ├── JourneySummaryCards.tsx
│   ├── JourneyFunnel.tsx
│   ├── JourneyCharts.tsx
│   ├── JourneyStepMatrix.tsx
│   ├── JourneyBreakdownTables.tsx
│   └── JourneySessionTimeline.tsx
├── hooks/
│   └── useCheckoutJourneyData.ts
└── types/
    └── checkoutJourneyTypes.ts
```

### CheckoutAnalytics.tsx
- Controla as **abas de nível superior**.
- Renderiza `DashboardTab` e `JourneyTab` com o modo apropriado (`overview`, `breakdown`, `sessions`).

### JourneyTab.tsx
- Centraliza a leitura dos eventos, agrupamento por sessão e cálculos de métricas.
- Renderiza sub-seções com base no `mode` recebido:
  - **overview** → cards, funil, gráficos e matriz de etapas.
  - **breakdown** → tabelas de agrupamento com paginação para produtos e produtores.
  - **sessions** → linha do tempo paginada por sessão.
- Mantém paginação local para dados volumosos (`produtos`, `produtores` e `sessões`).

### Hooks e Tipos
- `useCheckoutJourneyData` é o ponto único de carregamento de dados.
- `checkoutJourneyTypes.ts` define o contrato de eventos (`CheckoutEvent`) e o catálogo de nomes permitidos (`CheckoutEventName`).
- A tipagem garante consistência nos agrupamentos e no mapeamento das etapas.

## Jornada — interpretação dos eventos
A Jornada organiza eventos em **sessões** (`sessionId`) e considera apenas o que realmente aconteceu. Não há inferência de eventos ausentes.

### Funil de eventos
O funil é calculado a partir de eventos-chave em sequência:
1. `checkout_page_view`
2. `checkout_session_started`
3. `checkout_identification_completed`
4. `checkout_address_completed`
5. `checkout_submit_clicked`
6. `checkout_conversion_success`

A **conversão** exibida no funil é o percentual de sessões que avançam para o próximo evento da sequência.

### Matriz de etapas
A matriz mostra o desempenho por etapa:
- **Identificação** → eventos de início/conclusão/erro de identificação.
- **Endereço** → eventos de início/conclusão/erro de endereço.
- **Pagamento** → início do pagamento, checkout concluído e erros de pagamento.

Cada linha apresenta:
- Sessões iniciadas.
- Sessões concluídas.
- Taxa de erro.

### Linha do tempo por sessão
A linha do tempo apresenta, por sessão:
- ordem cronológica dos eventos,
- descrições,
- horário registrado.

## Visualizações gráficas
A Jornada inclui gráficos para tornar a leitura mais clara:

- **Conversão por etapa**: barras para volume de sessões + linha para conversão.
- **Conversão por método de pagamento**: comparação de volume e taxa de checkout concluído.
- **Distribuição por tipo de checkout**: gráfico de pizza.
- **Distribuição por modo de checkout**: gráfico de pizza.

Todos os gráficos possuem tooltips com contexto e mantêm o padrão visual do sistema.

## Tooltips e explicações
Para melhorar a compreensão dos indicadores, a Jornada exibe tooltips nos cards de resumo:

- **Sessões únicas**: total de `session_id` distintos.
- **Eventos totais**: total de eventos registrados no período.
- **Sessões com checkout concluído**: sessões com `checkout_conversion_success`, ou seja, cartão aprovado, PIX gerado ou boleto gerado.
- **Sessões com pagamento aprovado**: sessões com `checkout_payment_success` (somente cartão aprovado).
- **Sessões com erro**: sessões com eventos de erro em identificação, endereço ou pagamento.

Além disso:
- **Funil**: cada etapa explica o evento e o papel dele na conversão.
- **Matriz de etapas**: tooltips mostram quais eventos contam como início, conclusão e erro.
- **Sessões**: tooltip global reforça a ordem cronológica sem inferência.

## Paginação e escalabilidade
Para lidar com volume crescente:

- **Produtos**: tabela com paginação por página.
- **Produtores**: tabela com paginação por página.
- **Sessões**: timeline paginada por sessões.

As tabelas incluem sessões, sessões com checkout concluído e conversão percentual.

A paginação é controlada no `JourneyTab`, evitando re-renderizações desnecessárias e permitindo expansão futura.

## Padrões visuais e UX
- Componentes reutilizam cards, grids e estilos do sistema.
- Tooltips explicam a lógica de conversão e métricas.
- A divisão em abas reduz densidade visual e melhora a leitura.
- A hierarquia garante que **Dashboard** continue intacto.
