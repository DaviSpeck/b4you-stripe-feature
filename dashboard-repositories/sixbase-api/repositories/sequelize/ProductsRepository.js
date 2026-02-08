const Products = require('../../database/models/Products');

module.exports = class ProductsRepository {
  static async create(data) {
    const product = await Products.create(data);
    return product;
  }

  static async delete(where) {
    await Products.destroy({ where });
  }

  static async findWithProducer(where) {
    const product = await Products.findOne({
      where,
      include: [
        {
          association: 'producer',
        },
      ],
    });
    if (product) return product.toJSON();
    return product;
  }

  static async update(where, data) {
    await Products.update(data, { where });
  }
};
