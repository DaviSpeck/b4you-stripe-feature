const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const TransactionsRepository = require('../../repositories/sequelize/TransactionsRepository');
const { findRoleTypeByKey } = require('../../types/roles');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const date = require('../../utils/helpers/date');

module.exports.getTotal = async (req, res, next) => {
  const { user } = req;
  try {
    const created_at = date().subtract(30, 'days');
    const transactions = await TransactionsRepository.findAllRaw({
      created_at: {
        [Op.lte]: created_at,
      },
      id_user: user.id,
      id_type: findTransactionTypeByKey('commission').id,
      [Op.or]: {
        id_status: 2,
        [Op.and]: {
          id_status: 1,
          release_date: {
            [Op.ne]: null,
          },
        },
      },
    });

    return res.send({
      producer: transactions
        .filter((t) => t.id_role === findRoleTypeByKey('producer').id)
        .reduce((acc, { user_net_amount }) => acc + user_net_amount, 0),
      affiliate: transactions
        .filter((t) => t.id_role === findRoleTypeByKey('affiliate').id)
        .reduce((acc, { user_net_amount }) => acc + user_net_amount, 0),
      others: transactions
        .filter((t) => t.id_role === findRoleTypeByKey('coproducer').id)
        .reduce((acc, { user_net_amount }) => acc + user_net_amount, 0),
      createdAt: created_at,
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
