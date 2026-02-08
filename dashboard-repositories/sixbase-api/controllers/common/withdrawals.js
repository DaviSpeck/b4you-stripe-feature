const {
  findAllUserWithdrawals,
} = require('../../database/controllers/withdrawals');
const ApiError = require('../../error/ApiError');
const SerializeWithdrawal = require('../../presentation/dashboard/withdrawals');
const CreateWithdrawalUseCase = require('../../useCases/dashboard/withdrawals/CreateWithdrawal');

const getWithdrawalController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const withdrawals = await findAllUserWithdrawals(id_user);
    return res.status(200).send(new SerializeWithdrawal(withdrawals).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const createWithdrawalController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { amount },
  } = req;
  try {
    await new CreateWithdrawalUseCase({ amount, id_user }).execute();
    return res.status(200).send({
      success: true,
      message: 'Solicitação de saque realizada com sucesso.',
      status: 'PENDING',
    });
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

module.exports = { getWithdrawalController, createWithdrawalController };
