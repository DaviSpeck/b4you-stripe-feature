const { findUserEventType } = require('../../types/userEvents');
const { capitalizeName } = require('../../utils/formatters');

const serializeParams = (params, id_event) => {
  const eventCases = {
    7: () => `Produto : ${params.product_name}`,
    8: () => `Produto : ${params.product_name}`,
    9: () => `Produto : ${params.product_name}`,
    10: () => `Produto : ${params.product_name}`,
    14: () => `Produto : ${params.product_name}`,
    11: () => {
      const {
        old_values: {
          release_pix,
          fee_fixed_pix,
          fee_fixed_card,
          release_billet,
          fee_fixed_billet,
          fee_variable_pix,
          fee_variable_billet,
          release_credit_card,
          fee_fixed_refund_pix,
          fee_fixed_refund_card,
          fee_fixed_refund_billet,
          fee_fixed_amount_service,
          fee_variable_percentage_service,
        },
      } = params;
      return `<div style="line-height: 0;">
        <p style="line-height: 0;">PIX: ${release_pix}</p><p style="line-height: 0;">Taxa PIX: ${fee_fixed_pix}</p><p style="line-height: 0;">Taxa Cartão: ${fee_fixed_card}</p><p style="line-height: 0;">Boleto: ${release_billet}</p><p style="line-height: 0;">Taxa Boleto: ${fee_fixed_billet}</p><p style="line-height: 0;">Taxa Variável PIX: ${fee_variable_pix}</p><p style="line-height: 0;">Taxa Variável Boleto: ${fee_variable_billet}</p><p style="line-height: 0;">Cartão: ${release_credit_card}</p><p style="line-height: 0;">Taxa Reembolso PIX: ${fee_fixed_refund_pix}</p><p style="line-height: 0;">Taxa Reembolso Cartão: ${fee_fixed_refund_card}</p><p style="line-height: 0;">Taxa Reembolso Boleto: ${fee_fixed_refund_billet}</p><p style="line-height: 0;">Valor Fixo Serviço: ${fee_fixed_amount_service}</p><p style="line-height: 0;">Taxa Percentual Serviço: ${fee_variable_percentage_service}</p>
      </div>`;
    },
    15: () => {
      const {
        old_values: { email },
      } = params;
      return `Email anterior: ${email || 'Nao registrado'}`;
    },
    19: () =>
      `Email anterior : ${params.old_values.email} - Novo email : ${params.new_values.email}`,
    23: () => `ID_SALE : ${params.id_sale}`,
    24: () => `ID_SALE : ${params.id_sale}`,
  };

  const selectedCase = eventCases[id_event];
  if (selectedCase) {
    return selectedCase();
  }

  return '';
};

const serializeLogs = (logs) => {
  const {
    user_client,
    user,
    created_at,
    id_event,
    params,
    ip_address,
    id,
    id_user,
  } = logs;
  return {
    producer_name: id_user
      ? capitalizeName(user_client.full_name)
      : capitalizeName(params.student_name),
    link: id_user
      ? `/producer/${user_client.uuid}`
      : `/student/${params.student_uuid}`,
    full_name: capitalizeName(user.full_name),
    created_at,
    event: findUserEventType(id_event).label,
    params: serializeParams(params, id_event),
    ip_address,
    id,
    id_event,
  };
};

module.exports = class SerializeSales {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeLogs);
    }
    return serializeLogs(this.data);
  }
};
