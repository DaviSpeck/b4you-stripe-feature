---
title: Reembolso
---

# Reembolso

## 1. Visão Geral

Após 30 dias da transação, a API da PAGARME não permite efetuar o reembolso automaticamente, pois bloqueia chamadas fora do prazo. Por isso, qualquer reembolso pós-prazo deve ser processado manualmente.

## 2. Objetivo

Garantir que todos os reembolsos cujo prazo de 30 dias tenha expirado sejam realizados manualmente de forma padronizada, até que haja automatização desse processo.

## 3. Plano de Ação

1. Extrair os IDs de venda pendentes de reembolso a partir da planilha de controle.
2. Atualizar a lista de `provider_id` no script de reembolso conforme os dados extraídos.
3. Executar o script para gerar registros de reembolso e notificar o serviço de callbacks.

## 4. Critérios de Validação

- O registro da venda deve existir na tabela `sales_items` com `id_status = 4` (Reembolsado) e deve ser atualizado corretamente após o processamento do script na seção de "Vendas" do Backoffice.
- O registro de reembolso deve existir na tabela `refunds` após processamento do script.
- No Backoffice, o status da venda deve ser alterado para **Reembolsado**.

## 5. Script de Execução

```javascript
const { default: axios } = require('axios');
const Charges = require('../database/models/Charges');
const Refunds = require('../database/models/Refunds');
const Sales_items = require('../database/models/Sales_items');
const uuid = require('../utils/helpers/uuid');
const providers = [
  'ch_bpa4kG0uxClR4vz0',
  'ch_GXm2AolHvHXrWDzk',
  'ch_DdlgyXpCE4T0VkqL',
  'ch_P8NbgnQTYTAzpaKJ',
  'ch_GXVKmb8hJhZYln0p',
  'ch_rRKEYmxsGspLlo0G',
  'ch_plXOzy2uruYK98wx',
  'ch_k2reb70UlSm7X54W',
  'ch_Aznq97GfGuO8Wrdj',
  'ch_8qnRXqBSbNSgjWzD',
  'ch_bjVxzrKT1Tqd09XK',
];

module.exports.refundCharges = async () => {
  try {
    const charges = await Charges.findAll({
      nest: true,
      attributes: ['id'],
      where: {
        provider_id: providers,
      },
      include: [
        {
          association: 'sales_items',
          attributes: ['id', 'id_student'],
        },
      ],
    });
    for await (const charge of charges) {
      for await (const si of charge.sales_items) {
        try {
          // eslint-disable-next-line
          console.log(
            'processing sale item -> ',
            si.id,
            'charge -> ',
            charge.id,
          );
          let refund_id = null;
          const isThereARefund = await Refunds.findOne({
            raw: true,
            where: { id_sale_item: si.id, id_status: 1 },
            attributes: ['uuid', 'id_sale_item'],
          });
          if (isThereARefund) {
            // eslint-disable-next-line
            console.log('already had a refund -> ', isThereARefund);
            refund_id = isThereARefund.uuid;
          } else {
            // eslint-disable-next-line
            const ref = await Refunds.create({
              id_sale_item: si.id,
              id_student: si.id_student,
              id_status: 1,
              request_by_student: 0,
              reason: 'lista',
              uuid: uuid.v4(),
            });
            await Sales_items.update(
              { id_status: 6 },
              { where: { id: si.id } },
            );
            refund_id = ref.uuid;
            console.log('creating a refund -> ', ref.uuid);
          }
          const resp = await axios.post(
            'https://api-b4.b4you.com.br/api/callbacks/refunds',
            { refund_id },
          );

          // eslint-disable-next-line
          console.log('response status -> ', resp.status);
        } catch (error) {
          // eslint-disable-next-line
          console.log(
            'error while processing a refund -> ',
            error.response.data,
          );
        }
      }
    }
    console.log('finished processing...');
  } catch (error) {
    // eslint-disable-next-line
    console.log('error on process -> ', error);
  }
};
```

> **Observação:** Complete todas as seções acima antes de mover o ticket para **Concluído**.