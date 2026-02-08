const Offers_upsell_native = require('../../../../database/models/Offers_upsell-native');

class OffersUpsellNativeRepository {
  static async findMany(props) {
    const { where, values } = props;
    const res = await Offers_upsell_native.findAll({
      where,
      raw: true,
      ...(values && { attributes: values }),
    });
    return res;
  }

  static async createMany(data) {
    const res = await Offers_upsell_native.bulkCreate(data);
    return res;
  }

  static async remove(props) {
    const { where } = props;
    const res = await Offers_upsell_native.destroy({
      where,
      raw: true,
    });
    return res;
  }
}

module.exports = { OffersUpsellNativeRepository };
