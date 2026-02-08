const ApiError = require('../../error/ApiError');
const { invalidateCache } = require('../dashboard/order_bump');
const Product_offer = require('../../database/models/Product_offer');
const logger = require('../../utils/logger');
const { del: delRedis } = require('../../config/redis');

const offerCacheController = async (req, res, next) => {
  const { token, offer_id } = req.body;
  logger.info(`BACKOFFICE OFFER CACHE -> ${JSON.stringify(req.body)}`);
  try {
    if (token === process.env.BACKOFFICE_TOKEN_OFFER_CACHE) {
      const offer = await Product_offer.findOne({
        where: {
          uuid: offer_id,
        },
        attributes: ['uuid'],
      });
      if (offer) {
        await invalidateCache(offer.uuid);
        return res.sendStatus(200);
      }
      return res.sendStatus(401);
    }
    return res.sendStatus(401);
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

const blockController = async (req, res, next) => {
  const { token, key } = req.body;
  logger.info(`BACKOFFICE BLOCK CACHE CLEAN -> ${JSON.stringify(req.body)}`);
  try {
    if (token === process.env.BACKOFFICE_TOKEN_OFFER_CACHE) {
      await delRedis(key);
      return res.sendStatus(200);
    }
    return res.sendStatus(401);
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

module.exports = { offerCacheController, blockController };
