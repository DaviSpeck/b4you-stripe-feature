const Upsell_native_product = require('../../database/models/Upsell_native_product');

class UpsellNativeProductRepository {
  static async findOne(props) {
    const { where, values } = props;
    const res = await Upsell_native_product.findOne({
      where,
      raw: true,
      ...(values && { attributes: values }),
    });
    return res;
  }

  static async update(props) {
    const { where, data } = props;

    const dataWithoutId = { ...data };

    if ('id' in data) {
      delete dataWithoutId.id;
    }

    const res = await Upsell_native_product.update(data, {
      where,
    });
    return res;
  }

  static async create(data) {
    const res = await Upsell_native_product.create(data);
    return res;
  }

  static async remove(props) {
    const { where } = props;
    const res = await Upsell_native_product.destroy({
      where,
    });
    return res;
  }
}

module.exports = { UpsellNativeProductRepository };
