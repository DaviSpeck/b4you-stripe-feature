const ApiError = require('../../../error/ApiError');
const { OfferOptionsService } = require('./service/offerList');

class OffersUpsellList {
  static async get(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      const response = await OfferOptionsService.get({
        uuid: product_id,
        user,
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }
}

module.exports = { OffersUpsellList };
