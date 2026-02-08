const ApiError = require('../../error/ApiError');
const {
  UpsellNativeProductUseCase,
} = require('../../useCases/dashboard/upsellNative/upsellProduct.useCase');

class UpsellNativeProductController {
  static async get(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductUseCase.get({
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

  static async create(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductUseCase.create({
        uuid: product_id,
        user
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
      user,
      body,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductUseCase.update({
        data: body,
        uuid: product_id,
        user
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async updateImage(req, res, next) {
    const {
      user,
      file,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductUseCase.updateImage({
        file,
        uuid: product_id,
        user
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async updateEmbed(req, res, next) {
    const {
      user,
      body,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductUseCase.updateEmbed({
        data: body,
        uuid: product_id,
        user
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async updateTitleImage(req, res, next) {
    const {
      user,
      file,
      params: { product_id },
    } = req;

    try {
      const response = await UpsellNativeProductUseCase.updateTitleImage({
        file,
        uuid: product_id,
        user
      });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async updateBackgroundImageDesktop(req, res, next) {
    const {
      user,
      file,
      params: { product_id },
    } = req;

    try {
      const response =
        await UpsellNativeProductUseCase.updateBackgroundImageDesktop({
          file,
          uuid: product_id,
          user
        });
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async updateBackgroundImageMobile(req, res, next) {
    const {
      user,
      file,
      params: { product_id },
    } = req;

    try {
      const response =
        await UpsellNativeProductUseCase.updateBackgroundImageMobile({
          file,
          uuid: product_id,
          user
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
      user,
      params: { product_id },
    } = req;

    try {
      await UpsellNativeProductUseCase.remove({
        uuid: product_id,
        user
      });
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async removeImage(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      await UpsellNativeProductUseCase.removeImage({
        uuid: product_id,
        user
      });
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async removeTitleImage(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      await UpsellNativeProductUseCase.removeTitleImage({
        uuid: product_id,
        user
      });
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async removeBackgroundImageDesktop(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      await UpsellNativeProductUseCase.removeBackgroundImageDesktop({
        uuid: product_id,
        user
      });
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async removeBackgroundImageMobile(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      await UpsellNativeProductUseCase.removeBackgroundImageMobile({
        uuid: product_id,
        user
      });
      return res.status(200).json({ message: 'ok' });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).json({ message: error.message });
      }
      return next(error);
    }
  }

  static async removeEmbed(req, res, next) {
    const {
      user,
      params: { product_id },
    } = req;

    try {
      await UpsellNativeProductUseCase.removeEmbed({
        uuid: product_id,
        user
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

module.exports = { UpsellNativeProductController };
