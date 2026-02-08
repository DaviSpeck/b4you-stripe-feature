const { UpsellNativeOfferService } = require('./service/upsellOffer');

class UpsellNativeOfferUseCase {
  static async get(params) {
    const { uuid, user } = params;

    const response = await UpsellNativeOfferService.get({
      uuid,
      user,
    });

    return response;
  }

  static async getCheck(params) {
    const { uuid, user } = params;

    const response = await UpsellNativeOfferService.getCheck({
      uuid,
      user
    });

    return response;
  }

  static async create(params) {
    const { uuid, user } = params;

    const response = await UpsellNativeOfferService.create({
      uuid,
      user
    });

    return response;
  }

  static async update(params) {
    const { data, uuid, user } = params;

    const response = await UpsellNativeOfferService.update({
      data,
      uuid,
      user
    });

    return response;
  }

  static async updateEmbed(params) {
    const { data, uuid, user } = params;

    const response = await UpsellNativeOfferService.updateEmbed({
      data,
      uuid,
      user
    });

    return response;
  }

  static async updateImage(params) {
    const { uuid, file, user } = params;

    const response = await UpsellNativeOfferService.updateImage({
      file,
      uuid,
      user
    });

    return response;
  }

  static async updateTitleImage(params) {
    const { uuid, file, user } = params;
    const response = await UpsellNativeOfferService.updateTitleImage({
      file,
      uuid,
      user
    });
    return response;
  }

  static async updateBackgroundImageDesktop(params) {
    const { uuid, file, user } = params;
    const response =
      await UpsellNativeOfferService.updateBackgroundImageDesktop({
        file,
        uuid,
        user
      });
    return response;
  }

  static async updateBackgroundImageMobile(params) {
    const { uuid, file, user } = params;
    const response = await UpsellNativeOfferService.updateBackgroundImageMobile(
      {
        file,
        uuid,
        user
      },
    );
    return response;
  }

  static async remove(params) {
    const { uuid, user } = params;

    await UpsellNativeOfferService.remove({
      uuid,
      user
    });
  }

  static async removeEmbed(params) {
    const { uuid, user } = params;

    await UpsellNativeOfferService.removeEmbed({
      uuid,
      user
    });
  }

  static async removeImage(params) {
    const { uuid, user } = params;

    await UpsellNativeOfferService.removeImage({
      uuid,
      user
    });
  }

  static async removeBackgroundImageDesktop(params) {
    const { uuid, user } = params;

    await UpsellNativeOfferService.removeBackgroundImageDesktop({
      uuid,
      user
    });
  }

  static async removeBackgroundImageMobile(params) {
    const { uuid, user } = params;

    await UpsellNativeOfferService.removeBackgroundImageMobile({
      uuid,
      user
    });
  }

  static async removeTitleImage(params) {
    const { uuid, user } = params;

    await UpsellNativeOfferService.removeTitleImage({
      uuid,
      user
    });
  }
}

module.exports = { UpsellNativeOfferUseCase };
