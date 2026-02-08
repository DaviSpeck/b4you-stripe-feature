const { UpsellNativeProductService } = require('./service/upsellProduct');

class UpsellNativeProductUseCase {
  static async get(params) {
    const { uuid, user } = params;

    const response = await UpsellNativeProductService.get({
      uuid,
      user,
    });

    return response;
  }

  static async create(params) {
    const { uuid } = params;

    const response = await UpsellNativeProductService.create({
      uuid,
    });

    return response;
  }

  static async update(params) {
    const { data, uuid, user } = params;

    const response = await UpsellNativeProductService.update({
      data,
      uuid,
      user
    });

    return response;
  }

  static async updateImage(params) {
    const { uuid, file } = params;

    const response = await UpsellNativeProductService.updateImage({
      file,
      uuid,
    });

    return response;
  }

  static async updateEmbed(params) {
    const { data, uuid, user } = params;

    const response = await UpsellNativeProductService.updateEmbed({
      data,
      uuid,
      user
    });

    return response;
  }

  static async updateTitleImage(params) {
    const { uuid, file, user } = params;
    const response = await UpsellNativeProductService.updateTitleImage({
      file,
      uuid,
      user
    });
    return response;
  }

  static async updateBackgroundImageDesktop(params) {
    const { uuid, file } = params;
    const response =
      await UpsellNativeProductService.updateBackgroundImageDesktop({
        file,
        uuid,
      });
    return response;
  }

  static async updateBackgroundImageMobile(params) {
    const { uuid, file, user } = params;
    const response =
      await UpsellNativeProductService.updateBackgroundImageMobile({
        file,
        uuid,
        user
      });
    return response;
  }

  static async remove(params) {
    const { uuid, user } = params;

    await UpsellNativeProductService.remove({
      uuid,
      user
    });
  }

  static async removeEmbed(params) {
    const { uuid, user } = params;

    await UpsellNativeProductService.removeEmbed({
      uuid,
      user
    });
  }

  static async removeImage(params) {
    const { uuid, user } = params;

    await UpsellNativeProductService.removeImage({
      uuid,
      user
    });
  }

  static async removeBackgroundImageDesktop(params) {
    const { uuid, user } = params;

    await UpsellNativeProductService.removeBackgroundImageDesktop({
      uuid,
      user
    });
  }

  static async removeBackgroundImageMobile(params) {
    const { uuid, user } = params;

    await UpsellNativeProductService.removeBackgroundImageMobile({
      uuid,
      user
    });
  }

  static async removeTitleImage(params) {
    const { uuid, user } = params;

    await UpsellNativeProductService.removeTitleImage({
      uuid,
      user
    });
  }
}

module.exports = { UpsellNativeProductUseCase };
