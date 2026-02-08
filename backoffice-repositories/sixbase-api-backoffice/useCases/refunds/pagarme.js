const Students = require('../../database/models/Students');
const Users = require('../../database/models/Users');
const PagarMe = require('../../services/payments/Pagarme');

/**
 * Processa reembolso na API da Pagarme com splits de comissões.
 *
 * @param {Object} params - Parâmetros do reembolso
 * @param {Object} params.saleItem - Item de venda com comissões
 * @param {number} params.amount - Valor a ser reembolsado
 * @param {string} params.provider_id - ID da charge no provedor
 * @param {Object} [params.bank_account] - Dados da conta bancária (para boleto)
 * @param {string} params.provider - Provedor de pagamento
 * @returns {Promise<Object>} Resposta da API Pagarme
 */
module.exports.pagarmeRefund = async ({
  saleItem,
  amount,
  provider_id,
  bank_account = null,
  provider,
  numCard = 1,
}) => {
  const pagarme = new PagarMe(provider);
  const charge = await pagarme.getCharge(provider_id);
  const {
    last_transaction: { split, amount: chargeAmount },
  } = charge;

  const student = await Students.findOne({
    raw: true,
    attributes: ['full_name', 'document_number'],
    where: {
      id: saleItem.id_student,
    },
  });

  const refundAmountInCents = Math.round(amount * 100);

  // Check if this is a full refund (refund amount equals charge amount)
  const isFullRefund = refundAmountInCents >= chargeAmount;

  // For full refunds, use the exact charge amount from Pagar.me
  // This ensures we send exactly what Pagar.me expects
  const finalRefundAmount = isFullRefund ? chargeAmount / 100 : amount;

  // For full refunds, don't send splits as they're not needed
  const splits = [];

  if (!isFullRefund) {
    // For partial refunds, calculate proportional splits
    const { commissions } = saleItem;
    const users = await Users.findAll({
      raw: true,
      attributes: [
        'id',
        'pagarme_recipient_id',
        'pagarme_recipient_id_cnpj',
        'pagarme_recipient_id_3',
        'pagarme_recipient_id_cnpj_3',
      ],
      where: {
        id: commissions.map((c) => c.id_user),
      },
    });

    const b4youSplit = split.find(
      (s) => s.recipient.id === pagarme.b4you_recipient_id,
    );

    const otherSplits = split.filter(
      (s) => s.recipient.id !== pagarme.b4you_recipient_id,
    );

    // Calculate refund ratio for proportional split adjustment
    const refundRatio = refundAmountInCents / chargeAmount;

    for (const s of otherSplits) {
      const user = users.find((u) =>
        [
          u.pagarme_recipient_id,
          u.pagarme_recipient_id_cnpj,
          u.pagarme_recipient_id_3,
          u.pagarme_recipient_id_cnpj_3,
        ].includes(s.recipient.id),
      );
      if (user) {
        const comm = commissions.find((c) => c.id_user === user.id);
        // Apply proportional adjustment based on refund ratio
        const proportionalAmount = Math.round(comm.amount * 100 * refundRatio);
        splits.push({
          recipient_id: s.recipient.id,
          amount: proportionalAmount,
          type: 'flat',
          options: s.options,
        });
      }
    }

    // B4you split gets the remainder to ensure total equals refund amount
    splits.push({
      recipient_id: b4youSplit.recipient.id,
      amount:
        refundAmountInCents -
        splits.reduce((acc, v) => {
          acc += v.amount;
          return acc;
        }, 0),
      type: 'flat',
      options: b4youSplit.options,
    });
  }

  try {
    const refundData = {
      amount: numCard === 1 ? amount : finalRefundAmount, // Use exact charge amount for full refunds
      provider_id,
      full_name: student.full_name,
      document_number: student.document_number,
      bank_account,
    };

    // Only include splits for partial refunds
    if (splits.length > 0) {
      refundData.split = splits;
    }

    const apiResponse = await pagarme.refundCharge(refundData);

    return apiResponse;
  } catch (error) {
    throw error;
  }
};
