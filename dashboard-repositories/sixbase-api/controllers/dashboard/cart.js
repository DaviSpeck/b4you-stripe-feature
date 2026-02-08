const { findCartsPaginated } = require('../../database/controllers/cart');
const ApiError = require('../../error/ApiError');
const SerializeCarts = require('../../presentation/dashboard/cart');

module.exports.getAbandonedCarts = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { offer_uuid },
    query: { page = 0, size = 10 },
  } = req;
  try {
    const carts = await findCartsPaginated(
      {
        '$product.id_user$': id_user,
        '$offer.uuid$': offer_uuid,
        abandoned: true,
      },
      page,
      size,
    );
    return res.status(200).send({
      rows: new SerializeCarts(carts.rows).adapt(),
      count: carts.count,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};
