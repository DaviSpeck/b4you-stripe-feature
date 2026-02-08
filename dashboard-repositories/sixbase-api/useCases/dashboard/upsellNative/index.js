const ApiError = require('../../../error/ApiError');
const { UpsellNativeProductService } = require('./service/upsellProduct');

class UpsellNativeProductUseCase {
  static async get(req, res, next) {
    const {
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductService.get({
        uuid: product_id,
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async create(req, res, next) {
    const {
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductService.create({
        uuid: product_id,
      });
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async update(req, res, next) {
    const {
      body,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductService.update({
        data: body,
        uuid: product_id,
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async remove(req, res, next) {
    const {
      params: { product_id },
    } = req;
    try {
      await UpsellNativeProductService.remove({
        uuid: product_id,
      });
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }
}

module.exports = { UpsellNativeProductUseCase };
