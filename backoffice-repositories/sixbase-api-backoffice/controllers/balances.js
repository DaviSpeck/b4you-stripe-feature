const ApiError = require('../error/ApiError');
const BalanceRepository = require('../repositories/sequelize/BalanceRepository');
const FindUserBalances = require('../useCases/balances/FindUserBalance');
const FindUserMetrics = require('../useCases/balances/FindUserMetrics');
const FindUserTransactions = require('../useCases/balances/FindUserTransactions');
const FindSalesCommissions = require('../useCases/sales/FindSalesCommissions');
const BlockUserWithdrawal = require('../useCases/withdrawals/BlockWithdrawal');
const SalesItemsRepository = require('../repositories/sequelize/SalesItemsRepository');
const SerializeTransactions = require('../presentation/transactions/transactions');
const SerializeSaleInfo = require('../presentation/sales/SerializeSaleInfo');
const TransactionsRepository = require('../repositories/sequelize/TransactionsRepository');
const UsersRepository = require('../repositories/sequelize/UsersRepository');
const UsersRevenueRepository = require('../repositories/sequelize/UsersRevenueRepository');
const WithdrawalsSettingsRepository = require('../repositories/sequelize/WithdrawalsSettingsRepository');
const ProductsRepository = require('../repositories/sequelize/ProductsRepository');
const CoproductionsRepository = require('../repositories/sequelize/CoproductionsRepository');
const AffiliatesRepository = require('../repositories/sequelize/AffiliatesRepository');
const { paymentMethods } = require('../types/paymentMethods');
const { rolesTypes } = require('../types/roles');
const rawData = require('../database/rawData');
const { findSalesStatusByKey, salesStatus } = require('../status/salesStatus');
const SerializeSalesFilters = require('../presentation/sales/SalesFIlters');
const Charges = require('../database/models/Charges');
const Users = require('../database/models/Users');
const CommissionsRepository = require('../repositories/sequelize/CommissionsRepository');
const { createLogBackoffice } = require('../database/controllers/logs_backoffice');
const { findUserEventTypeByKey } = require('../types/userEvents');

module.exports.findUserBalances = async (req, res, next) => {
  try {
    const {
      params: { userUuid },
    } = req;
    const data = await new FindUserBalances({
      UsersRepository,
      BalanceRepository,
      TransactionsRepository,
      WithdrawalsSettingsRepository,
      UsersRevenueRepository,
      CommissionsRepository,
    }).execute({ user_uuid: userUuid });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      data,
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const validateFilters = ({
  userUuid,
  endDate,
  page = 0,
  paymentMethod,
  product,
  role,
  size = 10,
  startDate,
  status,
  input,
  src,
  sck,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term,
}) => {
  const query = {
    userUuid,
    page,
    size,
  };
  if (product && product !== 'all') query.productUUID = product;
  if (paymentMethod && paymentMethod !== 'all')
    query.paymentMethod = paymentMethod.split(',');
  if (input) query.input = input;
  if (status && status !== 'all') {
    query.id_status = status
      .split(',')
      .map((element) => findSalesStatusByKey(element).id);
  }
  if (startDate && endDate) {
    query.startDate = startDate;
    query.endDate = endDate;
  }
  if (role && role !== 'all') {
    const splitedRole = role.split(',');
    const queryRole = {
      producer: false,
      coproducer: false,
      affiliate: false,
      supplier: false,
      manager: false,
    };
    if (splitedRole.includes('1')) queryRole.producer = true;
    if (splitedRole.includes('2')) queryRole.coproducer = true;
    if (splitedRole.includes('3')) queryRole.affiliate = true;
    if (splitedRole.includes('4')) queryRole.supplier = true;
    if (splitedRole.includes('5')) queryRole.manager = true;
    query.role = queryRole;
  } else {
    query.role = {
      producer: true,
      coproducer: true,
      affiliate: true,
      supplier: true,
      manager: true,
    };
  }
  const queryTracking = {
    src: '',
    sck: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
  };
  if (src) queryTracking.src = src;
  if (sck) queryTracking.sck = sck;
  if (utm_source) queryTracking.utm_source = utm_source;
  if (utm_medium) queryTracking.utm_medium = utm_medium;
  if (utm_campaign) queryTracking.utm_campaign = utm_campaign;
  if (utm_content) queryTracking.utm_content = utm_content;
  if (utm_term) queryTracking.utm_term = utm_term;

  query.trackingParameters = queryTracking;

  return query;
};

module.exports.findUserTransactions = async (req, res, next) => {
  try {
    const {
      params: { userUuid },
      query,
    } = req;
    const formattedQuery = validateFilters({ userUuid, ...query });
    const transactions = await new FindUserTransactions({
      SalesItemsRepository,
    }).execute(formattedQuery);
    return res.status(200).send({
      count: transactions.count,
      rows: new SerializeTransactions(rawData(transactions.rows)).adapt(),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findSaleFilters = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;
  try {
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const productions = await ProductsRepository.findAll({ id_user: user.id });
    const coproductions = await CoproductionsRepository.findAllRaw({
      id_user: user.id,
    });
    const affiliations = await AffiliatesRepository.findAffiliations({
      id_user: user.id,
    });
    return res.status(200).send(
      new SerializeSalesFilters({
        productions,
        coproductions,
        affiliations,
        paymentMethods,
        salesStatus,
        rolesTypes,
      }).adapt(),
    );
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findUserMetrics = async (req, res, next) => {
  try {
    const {
      params: { userUuid },
    } = req;
    const user = await Users.findOne({
      raw: true,
      where: {
        uuid: userUuid,
      },
      attributes: ['id'],
    });
    const transactionsPromise = new FindUserMetrics({
      UsersRepository,
      CommissionsRepository,
    }).execute(userUuid);
    const lastThirdDaysPromise = CommissionsRepository.sum30DaysTotal(user.id);
    const [transactions, last_third_days] = await Promise.all([
      transactionsPromise,
      lastThirdDaysPromise,
    ]);
    return res.status(200).send({
      ...transactions,
      last_third_days,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.updateBlockWithdrawal = async (req, res, next) => {
  try {
    const {
      params: { userUuid },
      body: {
        blocked = true,
        reason = '',
      },
      user: { id },
    } = req;
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    await new BlockUserWithdrawal(
      WithdrawalsSettingsRepository,
      UsersRepository,
    ).execute(userUuid, blocked, id, ip_address, user_agent, reason);
    return res.status(200).send(true);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getAutoBlockStatus = async (req, res, next) => {
  try {
    const { userUuid } = req.params;

    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    const settings = await WithdrawalsSettingsRepository.find({
      id_user: user.id,
    });

    if (!settings) {
      return res.status(200).json({ enabled: false });
    }

    return res.status(200).json({
      enabled: !!settings.auto_block_enabled,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.updateAutoBlockStatus = async (req, res, next) => {
  try {
    const { userUuid } = req.params;
    const { enabled } = req.body;
    const { id: id_user_backoffice } = req.user;

    if (typeof enabled !== 'boolean') {
      throw ApiError.badRequest('Campo "enabled" deve ser booleano');
    }

    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');

    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    const settings = await WithdrawalsSettingsRepository.find({
      id_user: user.id,
    });

    if (settings) {
      await WithdrawalsSettingsRepository.update(
        { id_user: user.id },
        { auto_block_enabled: enabled },
      );
    } else {
      await Withdrawals_settings.create({
        id_user: user.id,
        auto_block_enabled: enabled,
      });
    }

    await createLogBackoffice({
      id_user_backoffice,
      id_event: enabled
        ? findUserEventTypeByKey('activate-auto-block-withdrawal').id
        : findUserEventTypeByKey('deactivate-auto-block-withdrawal').id,
      params: {
        user_agent,
        old_values: { auto_block_enabled: settings?.auto_block_enabled },
        new_values: { auto_block_enabled: enabled },
      },
      ip_address,
      id_user: user.id,
    });

    return res.status(200).json({
      message: enabled
        ? 'Automação de bloqueio/desbloqueio de saque ativada com sucesso'
        : 'Automação de bloqueio/desbloqueio de saque desativada com sucesso',
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getSaleData = async (req, res, next) => {
  try {
    const {
      params: { saleUuid },
    } = req;
    const sale = await new FindSalesCommissions(SalesItemsRepository).execute(
      saleUuid,
    );
    if (sale.payment_method === 'billet') {
      const { psp_id } = sale.transactions[0];
      const charge = await Charges.findOne({
        raw: true,
        where: {
          psp_id,
        },
        attributes: ['billet_url'],
      });
      sale.charge = charge;
    }
    return res.status(200).send(new SerializeSaleInfo(sale).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
