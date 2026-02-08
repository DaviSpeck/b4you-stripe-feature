import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Charges } from '../database/models/Charges.mjs';
import { Commissions } from '../database/models/Commissions.mjs';
import { Refunds } from '../database/models/Refunds.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Students } from '../database/models/Students.mjs';
import { Users } from '../database/models/Users.mjs';
import { HttpClient } from '../services/HTTPClient.mjs';
import { PagarMe } from '../services/Pagarme.mjs';
import { PaymentService } from '../services/PaymentService.mjs';
import { findCommissionsStatus } from '../status/commissions.mjs';
import { findRefundStatusByKey } from '../status/refundStatus.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';

export const RefundsUseCase = async ({ PAY42_KEY, PAY42_URL, URL_CALLBACK }) => {
  console.log('--INICIANDO--');

  const salesItems = await Sales_items.findAll({
    logging: true,
    where: {
      id_status: findSalesStatusByKey('request-refund').id,
      created_at: {
        [Op.gte]: '2025-11-25 00:00:00', // serviço estava travado varios dias, coloquei para nao disparar pedidos antigos
      },
    },
    attributes: ['created_at', 'id', 'price_total', 'id_student', 'payment_method'],
    include: [
      {
        association: 'refund',
        attributes: ['id', 'id_sale_item', 'id_status'],
        where: {
          id_status: [1, 2],
        },
      },
      {
        association: 'commissions',
      },
      {
        association: 'charges',
        where: {
          provider: ['B4YOU_PAGARME', 'B4YOU_PAGARME_3', 'B4YOU_PAGARME_2'],
        },
        attributes: [
          'psp_id',
          'refund_amount',
          'id_status',
          'price',
          'id',
          'provider',
          'provider_id',
        ],
      },
    ],
  });
  console.log('TAMANHO:', salesItems.length);
  const pay42 = new PaymentService({
    apiKey: PAY42_KEY,
    urlCallback: URL_CALLBACK,
    service: new HttpClient({ baseURL: PAY42_URL }),
  });

  for await (const sale of salesItems) {
    if (
      sale.charges[0].provider &&
      ['B4YOU_PAGARME', 'B4YOU_PAGARME_2', 'B4YOU_PAGARME_3'].includes(sale.charges[0].provider)
    ) {
      const pagarme = new PagarMe(sale.charges[0].provider);
      const charge = await pagarme.getCharge(sale.charges[0].provider_id);
      const {
        last_transaction: { split },
      } = charge;
      const splits = [];
      const { commissions, price_total: amount } = sale;
      const users = await Users.findAll({
        raw: true,
        attributes: [
          'id',
          'pagarme_recipient_id',
          'pagarme_recipient_id_cnpj',
          'pagarme_recipient_id_3',
          'pagarme_recipient_id_cnpj_3',
          'pagarme_cpf_id',
          'pagarme_cnpj_id',
        ],
        where: {
          id: commissions.map((c) => c.id_user),
        },
      });
      const b4youSplit = split.find((s) => s.recipient.id === pagarme.b4you_recipient_id);
      const otherSplits = split.filter((s) => s.recipient.id !== pagarme.b4you_recipient_id);
      for (const s of otherSplits) {
        const user = users.find((u) =>
          [
            u.pagarme_recipient_id,
            u.pagarme_recipient_id_cnpj,
            u.pagarme_recipient_id_3,
            u.pagarme_recipient_id_cnpj_3,
            u.pagarme_cpf_id,
            u.pagarme_cnpj_id,
          ].includes(s.recipient.id)
        );
        if (user) {
          const comm = commissions.find((c) => c.id_user === user.id);
          splits.push({
            recipient_id: s.recipient.id,
            amount: parseInt(comm.amount * 100, 10),
            type: 'flat',
            options: s.options,
          });
        }
      }

      splits.push({
        recipient_id: b4youSplit.recipient.id,
        amount:
          Math.round(amount * 100) -
          splits.reduce((acc, v) => {
            acc += v.amount;
            return acc;
          }, 0),
        type: 'flat',
        options: b4youSplit.options,
      });

      const student = await Students.findOne({
        raw: true,
        attributes: ['full_name', 'document_number'],
        where: {
          id: sale.id_student,
        },
      });

      let apiResponse = null;
      try {
        if (charge?.status === 'canceled') {
          console.log('venda ja reembolsada na pagarme, vamos ajustar os valores aqui apenas', charge.status, charge.paid_amount, charge.canceled_amount)
          if ((sale.charges[0].price * 100 === charge.canceled_amount) || (charge.paid_amount === charge.canceled_amount)) {
            console.log('venda totalmente reembolsada', sale.charges[0].price * 100)
            // comissoes reembolsadas
            await Commissions.update(
              { id_status: findCommissionsStatus('refunded').id },
              { where: { id_sale_item: sale.id } }
            );
            // sale item reembolsada
            await Sales_items.update(
              { id_status: findSalesStatusByKey('refunded').id },
              { where: { id: sale.id } }
            );
            // refund confirmado
            await Refunds.update(
              { id_status: findRefundStatusByKey('paid').id },
              { where: { id: sale.refund.id } }
            );
            // charge
            if (sale.charges[0].id_status === 2) {
              const refundTotal = sale.price_total + sale.charges[0].refund_amount;
              if (refundTotal === sale.charges[0].price) {
                await Charges.update(
                  {
                    id_status: 5,
                    refund_amount: sale.charges[0].price,
                  },
                  {
                    where: { id: sale.charges[0].id },
                  }
                );
              } else {
                await Charges.increment('refund_amount', {
                  by: sale.price_total,
                  where: {
                    id: sale.charges[0].id,
                  },
                });
              }
            }
            console.log('CONFIRMACAO DE TRATAMENTO NA VENDA - SALE ITEM ID-> ', sale.id);
          }
        } else {
          const refundData = {
            splits,
            amount,
            provider_id: sale.charges[0].provider_id,
            full_name: student.full_name,
            document_number: student.document_number,
            bank_account: null,
          };
          console.log('refundData', refundData);
          apiResponse = await pagarme.refundCharge(refundData);
          console.log('api response', apiResponse)
        }
      } catch (error) {
        if (error?.response?.data) {
          console.log(error.response.data)
        } else {
          console.log(error);
        }
        continue;
      }
      if (apiResponse) {
        await Refunds.update(
          { api_response: apiResponse },
          {
            where: {
              id: sale.refund.id,
            },
          }
        );
      }
    } else if (sale.charges[0].psp_id && sale.price_total) {
      if (sale.payment_method === 'pix') {
        const data = await pay42.getTransactionByPspId(sale.charges[0].psp_id);
        if (data.status === 1) {
          console.log('REEMBOLSANDO VENDA - SALE ITEM ID-> ', sale.id);
          const refundUuid = uuidv4();
          await Refunds.create({
            id_sale_item: sale.id,
            id_student: sale.id_student,
            id_status: 1,
            uuid: refundUuid,
          });
          try {
            const data = await pay42.refundPix({
              refund_id: refundUuid,
              psp_id: sale.charges[0].psp_id,
              amount: sale.price_total,
            });
            console.log('RESPONSE CALL PAY42 REFUNDS->', data);
            console.log('CONFIRMACAO DE REEMBOLSO NA VENDA - SALE ITEM ID-> ', sale.id);
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        console.log('REEMBOLSANDO VENDA - SALE ITEM ID-> ', sale.id);
        const refundUuid = uuidv4();
        await Refunds.create({
          id_sale_item: sale.id,
          id_student: sale.id_student,
          id_status: 1,
          uuid: refundUuid,
        });
        try {
          const data = await pay42.refundCard({
            refund_id: refundUuid,
            psp_id: sale.charges[0].psp_id,
            amount: sale.price_total,
          });
          console.log('RESPONSE CALL PAY42 REFUNDS->', data);
          console.log('CONFIRMACAO DE REEMBOLSO NA VENDA - SALE ITEM ID-> ', sale.id);
        } catch (error) {
          if (error.response.data.message === 'Transaction already refunded!') {
            console.log('to aqui dentro');
            // comissoes reembolsadas
            await Commissions.update(
              { id_status: findCommissionsStatus('refunded').id },
              { where: { id_sale_item: sale.id } }
            );
            // sale item reembolsada
            await Sales_items.update(
              { id_status: findSalesStatusByKey('refunded').id },
              { where: { id: sale.id } }
            );
            // refund confirmado
            await Refunds.update(
              { id_status: findRefundStatusByKey('paid').id },
              { where: { id: sale.refund.id } }
            );
            // charge
            if (sale.charges[0].id_status === 2) {
              const refundTotal = sale.price_total + sale.charges[0].refund_amount;
              if (refundTotal === sale.charges[0].price) {
                await Charges.update(
                  {
                    id_status: 5,
                    refund_amount: sale.charges[0].price,
                  },
                  {
                    where: { id: sale.charges[0].id },
                  }
                );
              } else {
                await Charges.increment('refund_amount', {
                  by: sale.price_total,
                  where: {
                    id: sale.charges[0].id,
                  },
                });
              }
            }
            console.log('CONFIRMACAO DE TRATAMENTO NA VENDA - SALE ITEM ID-> ', sale.id);
          }
        }
      }
    }
  }
};
