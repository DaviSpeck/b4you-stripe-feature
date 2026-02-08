const ApiError = require('../../error/ApiError');
const { resolveKeys, validateBody } = require('./common');

const isThereAnOrderBump = async (req, res, next) => {
  const {
    offer: { order_bumps },
  } = req;
  const { order_bump_id } = req.params;
  const selectedOrderBump = order_bumps.find(
    ({ uuid }) => uuid === order_bump_id,
  );
  if (!selectedOrderBump)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Order bump não encontrada',
      }),
    );
  req.order_bump = selectedOrderBump;
  return next();
};

const validateUpdateOrderBump = async (req, res, next) => {
  const keys = await validateBody(req.body, next);
  req.data = resolveKeys(req.body, keys);

  return next();
};

module.exports = {
  isThereAnOrderBump,
  validateUpdateOrderBump,
};
