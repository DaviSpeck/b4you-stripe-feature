const ApiError = require('../error/ApiError');
const SerializeSale = require('../presentation/delivery/sale');
const Delivery = require('../useCases/Delivery');

const deliveryController = async (req, res, next) => {
  const {
    params: { sale_item_id },
  } = req;
  try {
    const sale = await new Delivery(sale_item_id, req.session).execute();
    let eventId = null;
    if (req.session.pixels) {
      eventId = req.session.pixels.eventId;
    } else {
      eventId = req.session.id;
      req.session.pixels = {
        eventId,
      };
    }

    return res.status(200).send({
      ...new SerializeSale(sale, eventId).adapt(),
      uuid: sale_item_id,
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

module.exports = {
  deliveryController,
};
