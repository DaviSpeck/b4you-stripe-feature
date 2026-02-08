const ApiError = require('../../error/ApiError');
const SerializeSingleTransaction = require('../../presentation/membership/transactions');
const {
  findStudentTransactionsPaginated,
} = require('../../database/controllers/transactions');
const {
  findOneRefund,
  updateRefund,
} = require('../../database/controllers/refunds');
const { findRefundStatusByKey } = require('../../status/refundStatus');
const { updateSaleItem } = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');

const getTransactionsController = async (req, res, next) => {
  const {
    student: { id: id_student },
  } = req;
  const { page = 0, size = 10 } = req.query;

  try {
    const transactions = await findStudentTransactionsPaginated(
      { id_student },
      page,
      size,
    );
    return res.status(200).send({
      count: transactions.count,
      rows: new SerializeSingleTransaction(transactions.rows).adapt(),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const cancelRefundWarrantyController = async (req, res, next) => {
  const {
    student: { id: id_student },
    body: { refund_uuid },
  } = req;
  try {
    const refund = await findOneRefund({
      id_student,
      requested_by_student: true,
      id_status: findRefundStatusByKey('requested-by-student').id,
      uuid: refund_uuid,
    });
    if (!refund) throw ApiError.badRequest('Reembolso não encontrado');
    await updateRefund(
      { id_status: findRefundStatusByKey('refund-warranty-canceled').id },
      { uuid: refund_uuid },
    );
    await updateSaleItem(
      { id_status: findSalesStatusByKey('paid').id },
      { id: refund.id_sale_item },
    );
    return res.status(200).send({
      success: true,
      message:
        'Você cancelou esta solicitação de reembolso. O valor solicitado não será mais devolvido ou estornado.',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  getTransactionsController,
  cancelRefundWarrantyController,
};
