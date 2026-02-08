const logger = require('../../utils/logger');
const ApiError = require('../../error/ApiError');
const CreateRefundUseCase = require('../../useCases/refunds/CreateRefundSubscription');
const StudentSalesUseCase = require('../../useCases/refunds/StudentSales');
const MailService = require('../../services/MailService');
const RefundCodeUseCase = require('../../useCases/refunds/CreateCode');
const SalesItemsRepository = require('../../repositories/sequelize/SalesItemsRepository');
const SerializeSaleItem = require('../../presentation/refunds/getSaleItemInfo');
const StudentRepository = require('../../repositories/sequelize/StudentRepository');
const UserHistoryRepository = require('../../repositories/sequelize/UserHistoryRepository');
const {
  findOneSaleItem,
  updateSaleItem,
} = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { findOneRefund } = require('../../database/controllers/refunds');
const { findRefundStatus } = require('../../status/refundStatus');
const {
  updateUsersBalance,
} = require('../../useCases/common/refunds/usersBalances');
const Sales_items = require('../../database/models/Sales_items');
const { findUserBalanceController } = require('../common/balance');

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};

const getUserBalance = async (id_user) =>
  new Promise((resolve, reject) => {
    const req = {
      user: { id: id_user },
      route: { methods: { get: true } },
      originalUrl: '/test/balance',
    };

    const res = {
      status: (code) => ({
        send: (data) => {
          resolve({ status: code, data });
        },
      }),
    };

    const next = (error) => {
      reject(error);
    };

    findUserBalanceController(req, res, next);
  });

const getSaleItemRefundController = async (req, res, next) => {
  const { uuid_sale_item } = req.params;
  try {
    const saleItem = await findOneSaleItem({
      uuid: uuid_sale_item,
    });
    if (!saleItem) throw ApiError.badRequest('Item não encontrado');
    return res.send(new SerializeSaleItem(saleItem).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const getRefundCode = async (req, res, next) => {
  const {
    body: { email },
    ip,
  } = req;
  try {
    const agent = req.headers['user-agent'];
    await new RefundCodeUseCase(
      UserHistoryRepository,
      StudentRepository,
      SalesItemsRepository,
      makeMailService(),
    ).execute({ email, ip, agent });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const getRefundData = async (req, res, next) => {
  const {
    body: { code },
  } = req;
  try {
    const sales = await new StudentSalesUseCase({
      UserHistoryRepository,
      StudentRepository,
      SalesItemsRepository,
    }).execute(code);
    return res.send(new SerializeSaleItem(sales).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const saleItemRefundController = async (req, res, next) => {
  const {
    params: { uuid_sale_item },
    body: { reason, description },
  } = req;
  try {
    const saleItem = await Sales_items.findOne({
      nest: true,
      subQuery: false,
      attributes: [
        'id_status',
        'valid_refund_until',
        'paid_at',
        'price_total',
        'uuid',
        'payment_method',
        'id_sale',
        'id_student',
        'id',
        'id_subscription',
      ],
      where: {
        uuid: uuid_sale_item,
        id_status: findSalesStatusByKey('paid').id,
      },
      include: [
        {
          association: 'commissions',
        },
        {
          association: 'product',
          attributes: ['id_type', 'payment_type', 'name', 'refund_email'],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['full_name', 'email', 'id'],
            },
          ],
        },
        {
          association: 'charges',
          attributes: ['uuid', 'psp_id', 'provider', 'provider_id'],
        },
        {
          association: 'student',
          attributes: [
            'full_name',
            'email',
            'whatsapp',
            'document_number',
            'bank_code',
            'account_agency',
            'account_number',
          ],
        },
      ],
    });
    if (!saleItem) throw ApiError.badRequest('Item não encontrado');
    if (saleItem.product.id_type === 4)
      throw ApiError.badRequest(
        'Não é possível solicitar neste canal reembolso de produto físico',
      );

    let allUsersHaveBalance = true;
    for await (const data of saleItem.commissions) {
      console.log('Data commissions', JSON.stringify(data));
      const balance = await getUserBalance(data.id_user);
      const totalAmount =
        balance.data.pending_balance + balance.data.max_withdrawal_amount;
      console.log('Amounts:', totalAmount, data.amount);
      if (totalAmount < data.amount) {
        allUsersHaveBalance = false;
        break;
      }
    }

    if (!allUsersHaveBalance) {
      throw ApiError.badRequest(
        'Não é possível solicitar o reembolso, contate nosso suporte.',
      );
    }
    const message = await new CreateRefundUseCase({
      saleItem,
      reason,
      description,
    }).execute();

    return res.send({
      success: true,
      message,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    if (error instanceof Error) {
      const parseError = JSON.parse(error.message);
      if (parseError.code && parseError.code === 'bank')
        return res.status(400).send(parseError);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const cancelRefund = async (req, res, next) => {
  const {
    params: { uuid_sale_item },
  } = req;
  try {
    const saleItem = await findOneSaleItem({ uuid: uuid_sale_item });
    if (!saleItem) throw ApiError.badRequest('Item não encontrado');
    if (saleItem.id_status !== findSalesStatusByKey('request-refund').id)
      throw ApiError.badRequest('Item não encontrado');
    await updateSaleItem(
      { id_status: findSalesStatusByKey('paid').id },
      { id: saleItem.id },
    );
    const refund = await findOneRefund({
      uuid: saleItem.refund.uuid,
      id_status: [
        findRefundStatus('Solicitado pelo comprador').id,
        findRefundStatus('Solicitado pelo produtor').id,
        findRefundStatus('Solicitado reembolso em garantia').id,
      ],
    });
    await updateUsersBalance(refund, 'increment', null);
    saleItem.id_status = findSalesStatusByKey('paid').id;
    return res.send(new SerializeSaleItem(saleItem).adapt());
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) return res.status(error.code).send(error);
    if (error instanceof Error) {
      const parseError = JSON.parse(error.message);
      if (parseError.code && parseError.code === 'bank')
        return res.status(400).send(parseError);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports = {
  getSaleItemRefundController,
  saleItemRefundController,
  getRefundCode,
  getRefundData,
  cancelRefund,
};
