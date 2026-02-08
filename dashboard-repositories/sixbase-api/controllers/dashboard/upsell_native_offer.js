const ApiError = require('../../error/ApiError');
const {
  UpsellNativeOfferUseCase,
} = require('../../useCases/dashboard/upsellNative/upsellOffer.useCase');

class UpsellNativeOfferController {
  static async get(req, res, next) {
    const {
      user,
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.get({
        uuid: offer_id,
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

  static async getCheck(req, res, next) {
    const {
      user,
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.getCheck({
        uuid: offer_id,
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

  static async create(req, res, next) {
    const {
      user,
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.create({
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.update({
        data: body,
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.updateImage({
        file,
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.updateEmbed({
        data: body,
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      const response = await UpsellNativeOfferUseCase.updateTitleImage({
        file,
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      const response =
        await UpsellNativeOfferUseCase.updateBackgroundImageDesktop({
          file,
          uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      const response =
        await UpsellNativeOfferUseCase.updateBackgroundImageMobile({
          file,
          uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      await UpsellNativeOfferUseCase.remove({
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      await UpsellNativeOfferUseCase.removeImage({
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      await UpsellNativeOfferUseCase.removeEmbed({
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      await UpsellNativeOfferUseCase.removeTitleImage({
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      await UpsellNativeOfferUseCase.removeBackgroundImageDesktop({
        uuid: offer_id,
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
      params: { offer_id },
    } = req;

    try {
      await UpsellNativeOfferUseCase.removeBackgroundImageMobile({
        uuid: offer_id,
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

module.exports = { UpsellNativeOfferController };
