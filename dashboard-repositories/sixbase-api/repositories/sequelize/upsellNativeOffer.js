const Upsell_native_offer = require('../../database/models/Upsell_native_offer');

class UpsellNativeOfferRepository {
  static async findOne(props) {
    const { where, values } = props;
    const res = await Upsell_native_offer.findOne({
      where,
      raw: true,
      ...(values && { attributes: values }),
    });
    return res;
  }

  static async update(props) {
    const { where, data } = props;
    const res = await Upsell_native_offer.update(data, {
      where,
    });
    return res;
  }

  static async create(data) {
    const res = await Upsell_native_offer.create(data);
    return res;
  }

  static async remove(upsell_id) {
    const res = await Upsell_native_offer.destroy({
      where: { id: upsell_id },
    });
    return res;
  }
}

module.exports = { UpsellNativeOfferRepository };
