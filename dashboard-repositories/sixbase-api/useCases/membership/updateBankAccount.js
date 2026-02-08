const ApiError = require('../../error/ApiError');
const { updateStudent } = require('../../database/controllers/students');
const { findBank } = require('../../utils/banks');
const {
  findAllRefunds,
  updateRefund,
} = require('../../database/controllers/refunds');
const { findRefundStatus } = require('../../status/refundStatus');
const { findTransaction } = require('../../database/controllers/transactions');
const { findTransactionType } = require('../../types/transactionTypes');
const PaymentService = require('../../services/PaymentService');

module.exports = class {
  constructor({
    id_student,
    bank: { bank_code, account_agency, account_number },
  }) {
    this.id_student = id_student;
    this.bank_code = bank_code;
    this.account_agency = account_agency;
    this.account_number = account_number;
  }

  async execute() {
    const bank = findBank(this.bank_code);
    if (!bank) throw ApiError.badRequest('Código bancário inválido');
    await updateStudent(this.id_student, {
      bank_code: this.bank_code,
      account_agency: this.account_agency,
      account_number: this.account_number,
    });
    const refunds = await findAllRefunds({
      id_student: this.id_student,
      id_status: findRefundStatus('Aguardando conta bancária do estudante').id,
    });
    for await (const refund of refunds) {
      const refundBankAccount = {
        ispb: findBank(this.bank_code).ispb,
        bank_name: findBank(this.bank_code).label,
        account_agency: this.account_agency,
        account_number: this.account_number,
      };
      const transaction = await findTransaction({
        id_sale_item: refund.id_sale_item,
        id_type: findTransactionType('Pagamento').id,
      });
      const apiResponse = await PaymentService.refundBillet({
        transaction_id: transaction.uuid,
        refund_id: refund.uuid,
        bank: refundBankAccount,
      });
      await updateRefund(
        {
          id_status: findRefundStatus('Solicitado pelo produtor').id,
          api_response: apiResponse,
        },
        { id: refund.id },
      );
    }
  }
};
