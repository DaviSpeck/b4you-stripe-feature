const { Create } = require('./create');
const { Get } = require('./get');
const {
  Remove,
  RemoveEmbed,
  RemoveImage,
  RemoveTitleImage,
  RemoveBackgroundImageDesktop,
  RemoveBackgroundImageMobile,
} = require('./remove');
const {
  Update,
  UpdateImage,
  UpdateEmbed,
  UpdateBackgroundImageMobile,
  UpdateBackgroundImageDesktop,
  UpdateTitleImage,
} = require('./update');

class UpsellNativeProductService {
  static async get(params) {
    const { uuid, user } = params;
    const response = await Get({ uuid, user });
    return response;
  }

  static async create(params) {
    const { uuid, user } = params;
    const response = await Create({ uuid, user });
    return response;
  }

  static async update(params) {
    const { uuid, data, user } = params;
    const response = await Update({
      uuid,
      data,
      user
    });
    return response;
  }

  static async updateEmbed(params) {
    const { uuid, data, user } = params;
    const response = await UpdateEmbed({
      uuid,
      data,
      user
    });
    return response;
  }

  static async updateImage(params) {
    const { uuid, file, user } = params;
    const response = await UpdateImage({
      uuid,
      file,
      user
    });
    return response;
  }

  static async updateTitleImage(params) {
    const { uuid, file, user } = params;
    const response = await UpdateTitleImage({
      uuid,
      file,
      user
    });
    return response;
  }

  static async updateBackgroundImageDesktop(params) {
    const { uuid, file, user } = params;
    const response = await UpdateBackgroundImageDesktop({
      uuid,
      file,
      user
    });
    return response;
  }

  static async updateBackgroundImageMobile(params) {
    const { uuid, file, user } = params;
    const response = await UpdateBackgroundImageMobile({
      uuid,
      file,
      user
    });
    return response;
  }

  static async remove(params) {
    const { uuid, user } = params;
    await Remove({ uuid, user });
  }

  static async removeImage(params) {
    const { uuid, user } = params;
    await RemoveImage({ uuid, user });
  }

  static async removeTitleImage(params) {
    const { uuid, user } = params;
    await RemoveTitleImage({ uuid, user });
  }

  static async removeBackgroundImageDesktop(params) {
    const { uuid, user } = params;
    await RemoveBackgroundImageDesktop({ uuid, user });
  }

  static async removeBackgroundImageMobile(params) {
    const { uuid, user } = params;
    await RemoveBackgroundImageMobile({ uuid, user });
  }

  static async removeEmbed(params) {
    const { uuid, user } = params;
    await RemoveEmbed({ uuid, user });
  }
}

module.exports = { UpsellNativeProductService };
