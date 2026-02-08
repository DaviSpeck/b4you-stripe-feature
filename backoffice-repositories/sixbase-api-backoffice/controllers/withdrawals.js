const ApiError = require('../error/ApiError');
const FindUserWithdrawals = require('../useCases/withdrawals/FindUserWithdrawals');
const WithdrawalRepository = require('../repositories/sequelize/WithdrawalsRepository');
const UserRepository = require('../repositories/sequelize/UsersRepository');
const SerializeUserWithdrawals = require('../presentation/withdrawals/User');
const ExportToXlsx = require('../useCases/exports/withdrawals');
const PaymentService = require('../services/PaymentService');

module.exports.findUserWithdrawals = async (req, res, next) => {
  try {
    const {
      query: { page = 0, size = 10 },
      params: { userUuid },
    } = req;
    const { rows, count } = await new FindUserWithdrawals(
      WithdrawalRepository,
      UserRepository,
    ).execute({ user_uuid: userUuid, page, size });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows: new SerializeUserWithdrawals(rows).adapt(),
      },
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

module.exports.exportToXlsx = async (req, res, next) => {
  try {
    const {
      query: { page = 0, size = 10 },
      params: { userUuid },
    } = req;
    const { rows } = await new FindUserWithdrawals(
      WithdrawalRepository,
      UserRepository,
    ).execute({ user_uuid: userUuid, page, size });
    const withdrawals = new SerializeUserWithdrawals(rows).adapt();
    const file = await new ExportToXlsx(withdrawals).execute();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="saques"');
    return file.xlsx.write(res).then(() => {
      res.status(200).end();
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

module.exports.findWithdrawalPspId = async (req, res, next) => {
  try {
    const {
      query: { psp_id },
    } = req;
    const response = await PaymentService.getWithdrawalPspId(psp_id);
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: response,
      status: 200,
    });
  } catch (error) {
    if (
      error?.response?.data?.message === 'Transaction is in manual approval'
    ) {
      return res.send({
        success: true,
        message: 'Busca realizada com sucesso',
        info: [error.response.data],
      });
    }
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