const Products = require('../../../../database/models/Products');

class ProductRepository {
  static async findOne(props) {
    const { where, values } = props;

    const res = await Products.findOne({
      where,
      raw: true,
      ...(values && { attributes: values }),
    });
    return res;
  }

  static async update(props) {
    const { where, data } = props;
    const res = await Products.update(data, {
      where,
    });
    return res;
  }
}

module.exports = { ProductRepository };
