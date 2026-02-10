---
title: Repasse de Comissões
---

# Repasse de Comissões

## 1. Visão Geral

Após 30 dias da venda, a API da PAGARME não permite processar comissões automaticamente, pois bloqueia chamadas fora do prazo. Por isso, repasses de comissão após esse período devem ser feitos manualmente.

## 2. Objetivo

Padronizar o procedimento de repasse de comissões para afiliados quando o prazo da API tiver expirado, garantindo precisão e rastreabilidade até que haja automatização completa.

## 3. Plano de Ação

1. Extrair da planilha de controle os seguintes dados:
   * IDs de venda (`sale_id`)
   * IDs da PAGARME (`recipient_id`)
   * Valores de comissão (`amount`)
2. Atualizar as listas de `sales`, `recipients` e `amounts` no script de repasse.
3. Executar o script para:
   * Criar ou validar registros de comissão na tabela `Commissions`.
   * Atualizar métricas diárias de vendas para produtor e afiliado.

## 4. Critérios de Validação

* Na tabela `commissions`, deve existir um registro para cada `id_sale_item` com o valor correto para `id_user`.
* O repasse de comissão deve ter sido refletido corretamente na aplicação, confirmar no backoffice.

## 5. Script de Execução

```javascript
const Sales_items = require('../database/models/Sales_items');
const Users = require('../database/models/Users');
const { Op } = require('sequelize');
const date = require('../utils/helpers/date');
const models = require('../database/models');
const Commissions = require('../database/models/Commissions');
const Affiliates = require('../database/models/Affiliates');
const SalesMetricsDaily = require('../database/models/SalesMetricsDaily');
const { DATABASE_DATE } = require('../types/dateTypes');

const sales = [
  '79747008-6a0d-4649-9100-44c5f9d15040',
  '7dbc1635-649e-4ee5-b933-5deaf485d23a',
  'be4562f1-ae29-4cc3-8d23-1b6dfc83d1b5',
  'd99f552b-e70f-4471-a997-370c459b1b0e',
  '0428c924-5696-4f1d-890b-756e7e85feeb',
  'c504c84b-4b34-4dcb-9320-d38ec018e4fa',
  '27fc684e-fd5f-4aa9-947b-15d24dbc92a6',
  'bfaf4aca-0027-4ad9-b774-b0900e467ed2',
];

const recipients = [
  're_cm823j2pf6qlq0l9ttxg5wp4m',
  're_cm823j2pf6qlq0l9ttxg5wp4m',
  're_cm823j2pf6qlq0l9ttxg5wp4m',
  're_cm823j2pf6qlq0l9ttxg5wp4m',
  're_cm823j2pf6qlq0l9ttxg5wp4m',
  're_cm823j2pf6qlq0l9ttxg5wp4m',
  're_cm3uuw6g9d18n0l9ttnv2zxu6',
  're_cm3uuw6g9d18n0l9ttnv2zxu6',
];

const amounts = [101.15, 101.15, 72.25, 159.58, 74.98, 37.96, 100.45, 100.45];

module.exports = async () => {
  console.log('sales size -> ', sales.length);
  console.log('recipients size -> ', recipients.length);
  console.log('amounts size -> ', amounts.length);
  try {
    for await (const [index, sale] of sales.entries()) {
      console.log(sale, index);
      const si = await Sales_items.findOne({
        nest: true,
        where: {
          uuid: sale,
        },
        include: [
          {
            association: 'commissions',
          },
        ],
      });
      if (!si) {
        console.log('sale not found -> ', sale);
        continue;
      }
      const time = date(si.paid_at)
        .startOf('d')
        .add(3, 'h')
        .format(DATABASE_DATE);
      console.log(time);
      const amount = amounts[index];
      const recipient = recipients[index];
      const ua = await Users.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          [Op.or]: {
            pagarme_recipient_id: recipient,
            pagarme_recipient_id_cnpj: recipient,
            pagarme_cpf_id: recipient,
            pagarme_cnpj_id: recipient,
            pagarme_recipient_id_3: recipient,
            pagarme_recipient_id_cnpj_3: recipient,
          },
        },
      });

      if (!ua) {
        console.log(
          'usuario nao encontrado -> sale: ',
          sale,
          ' recipient -> ',
          recipient,
        );
        continue;
      }

      const aff = await Affiliates.findOne({
        raw: true,
        where: {
          id_user: ua.id,
          id_product: si.id_product,
        },
        status: 2,
      });

      if (!aff) {
        console.log(recipients[index]);
        console.log(
          'afiliado nao encontrado -> sale: ',
          sale,
          ' user -> ',
          ua.id,
          ' id_product -> ',
          si.id_product,
        );
        continue;
      }
      //console.log(aff);

      const t = await models.sequelize.transaction();
      const producerCommission = await si.commissions.find(
        (c) => c.id_role === 1,
      );
      try {
        await Commissions.create(
          {
            id_user: ua.id,
            amount,
            id_sale_item: si.id,
            release_date: producerCommission.release_date,
            id_status: producerCommission.id_status,
            id_role: 3,
          },
          { transaction: t },
        );
        await Commissions.update(
          { amount: producerCommission.amount - amount },
          { where: { id: producerCommission.id }, transaction: t },
        );
        await Sales_items.update(
          { id_affiliate: aff.id },
          {
            where: {
              id: si.id,
            },
            transaction: t,
          },
        );
        // produtor
        await SalesMetricsDaily.decrement('paid_total', {
          by: amounts[index],
          where: {
            id_product: si.id_product,
            id_user: producerCommission.id_user,
            time,
          },
        });

        //aff
        const oldMetrics = await SalesMetricsDaily.findOne({
          raw: true,
          where: {
            id_user: aff.id_user,
            time,
            id_product: si.id_product,
          },
        });
        if (oldMetrics) {
          await SalesMetricsDaily.increment('paid_total', {
            by: amount[index],
            where: {
              id: oldMetrics.id,
            },
            transaction: t,
          });
          await SalesMetricsDaily.increment('paid_count', {
            by: 1,
            where: {
              id: oldMetrics.id,
            },
            transaction: t,
          });
        } else {
          await SalesMetricsDaily.create(
            {
              id_user: aff.id_user,
              id_product: si.id_product,
              time,
              paid_total: amount[index],
              paid_count: 1,
            },
            {
              transaction: t,
            },
          );
        }
        await t.commit();
      } catch (error) {
        console.log('error inside -> ', error);
        await t.rollback();
      }
    }
  } catch (error) {
    console.log(error);
  }
  console.log('finalizouuuuuuuuuuuuuuuuuu');
};
```

> **Observação:** Confirme todos os passos antes de mover o ticket para **Concluído**.