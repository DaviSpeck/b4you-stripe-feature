const Product_images = require('../../database/models/Product_images');

module.exports = class ProductImagesRepository {
  static async create(data) {
    const productImages = await Product_images.create(data);
    return productImages;
  }

  static async delete(where) {
    await Product_images.destroy({ where });
  }

  static async find(where) {
    const productImages = await Product_images.findOne({
      where,
    });
    return productImages;
  }
};
