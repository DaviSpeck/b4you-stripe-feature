---
title: abandonedCart
---

# abandonedCart

Marca como abandonados carrinhos criados há mais de 1h. Após validação, atualiza no banco e envia dados para as filas integrations e webhookEvent, gerando eventos e notificações, até para afiliados.

### 📍 Localização

- **Repositório GitHub**: `b4you-lambdas`
- **Diretório**: `lambdas/js/abandonedCart`
- **Serviço AWS**: `b4you-production-abandoned-cart` ou `b4you-sandbox-abandoned-cart`
- **Invocação**: Agendada, manual ou por fila SQS

---

### 🧱 Principais Arquivos e Pastas

| Arquivo/Pasta | Função |
| --- | --- |
| `index.mjs` | Entrada principal da função Lambda |
| `config/sqs.mjs` | Instância do cliente SQS |
| `database/sequelize.mjs` | Inicialização da conexão Sequelize |
| `database/models/` | Modelos Sequelize (Cart, Products, Charges, etc.) |
| `queues/aws.mjs` | Envio de mensagens para filas SQS (integrations, webhookEvent) |
| `date.mjs` | Helper de datas baseado em Moment.js |
| `integrationRulesTypes.mjs` | Tipos de eventos de integração usados na geração do webhook |

---

### 🔁 Fluxo de Execução

1. Conecta ao banco de dados MySQL via Sequelize.
2. Busca carrinhos criados há mais de 1h e que ainda não foram marcados como abandonados.
3. Verifica se houve tentativa de compra (com ou sem pagamento).
4. Se não houver `sale_item` ou se o `payment_method` for nulo:
    - Marca o carrinho como abandonado.
    - Publica na fila `integrations` e `webhookEvent`.
5. Se houver `sale_item`, mas o pagamento ainda não foi feito:
    - Verifica se o `next_business_day` já passou.
    - Em caso positivo, marca como abandonado e publica nas filas.
6. Gera dados estruturados com informações de produto, cliente e checkout.

---

### 📦 Dependências

- `sequelize`: ORM para integração com banco MySQL
- `moment`: Manipulação de datas
- `@aws-sdk/client-sqs`: Envio de mensagens para SQS
- `uuid`: Geração de IDs únicos para deduplicação de mensagens

---

### 🔐 Variáveis de Ambiente

- `MYSQL_DATABASE`, `MYSQL_HOST`, `MYSQL_PASSWORD`, `MYSQL_USERNAME`, `MYSQL_PORT`: Configurações de banco
- `SQS_PREFIX`, `ENVIRONMENT`: Usados na composição das URLs das filas

---

### 📨 Fila(s) Utilizadas

- `integrations.fifo`
- `webhookEvent.fifo`

---

### 🗒️ Observações Técnicas

- Carrinhos com `sale_item` e `charges` são avaliados com base em `next_business_day`.
- O helper `DateHelper` encapsula o uso do Moment.js e lida com lógica de "nextBusinessDay".
- Eventos são categorizados conforme `integrationRulesTypes.mjs`, sendo usado o tipo `abandoned-cart` (`id: 5`).
- Afiliados, quando presentes no `sale_item`, geram um segundo webhook direcionado ao `id_user` do afiliado.