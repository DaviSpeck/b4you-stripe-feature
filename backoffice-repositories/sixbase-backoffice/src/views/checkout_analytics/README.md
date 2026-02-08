# Analytics Checkout — Dashboard + Jornada

## Estrutura das abas
- **Dashboard**: mantém o conteúdo e comportamento já existentes na página de Analytics Checkout.
- **Jornada**: nova visualização baseada em eventos de checkout, pronta para integração com API.

A navegação usa o padrão de tabs já aplicado em outras áreas do produto. As abas apenas alternam o conteúdo renderizado, sem criar novas rotas ou duplicar filtros globais.

## Diferenças entre Dashboard e Jornada
- **Dashboard**: consolida métricas agregadas de vendas, conversão e origem (conteúdo atual).
- **Jornada**: analisa o fluxo do usuário por sessão, mostrando funil, progresso por etapas, linha do tempo e segmentações por checkout, produto e produtor.

## Filtros da Jornada
A Jornada reaproveita o mesmo padrão visual de filtros do Dashboard, porém com critérios adequados aos eventos:
- Período (obrigatório)
- Produtor
- Produto
- Tipo de checkout
- Modo de checkout
- Método de pagamento
- Ambiente (execution_environment)
- Sessões com checkout concluído
- Sessões com erro

Filtros de status/região/estado não são exibidos na Jornada.

## Como a Jornada interpreta os eventos
A Jornada agrupa eventos por `sessionId` e considera a sequência real registrada. Não há inferência de eventos ausentes — se um evento não existe, ele não aconteceu.

Principais interpretações:
- **Funil**: conta sessões que atingiram eventos-chave (visualização, sessão iniciada, identificação, endereço, pagamento enviado e checkout concluído).
- **Progresso por etapa**: calcula iniciadas, concluídas e taxa de erro por etapa (`identification`, `address`, `payment`).
- **Linha do tempo**: exibe a ordem dos eventos por sessão, com horário e descrição.
- **Conversão**: representa o percentual de sessões que avançam para o próximo evento da sequência considerada.
- **Checkout concluído** (`checkout_conversion_success`): PIX gerado, boleto gerado ou cartão aprovado.
- **Pagamento aprovado** (`checkout_payment_success`): somente cartão aprovado.

## Uso do offerId para produto/produtor
O `offerId` é enriquecido com dados de produto e produtor. Essa relação permite:
- Etiquetas mais claras na linha do tempo.
- Agrupamentos por produto e produtor.
- Preparação para filtros e segmentações futuras.

## Limitações atuais
- Não existe inferência de eventos: apenas o que foi registrado é considerado.
