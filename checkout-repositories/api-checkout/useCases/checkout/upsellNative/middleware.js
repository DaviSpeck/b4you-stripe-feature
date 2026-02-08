const { verifyOfferExists } = require('./validators/offerExists.validator');
const { verifyProductExists } = require('./validators/productExists.validator');

const UserDataMiddleware = async (req, res, next) => {
  const {
    params: { offer_uuid },
  } = req;

  const { id_product } = await verifyOfferExists({
    uuid: offer_uuid,
    values: ['id_product'],
  });

  const { id_user } = await verifyProductExists({
    id: id_product,
    values: ['id_user'],
  });

  req.user_id = id_user;

  return next();
};

module.exports = { UserDataMiddleware };
