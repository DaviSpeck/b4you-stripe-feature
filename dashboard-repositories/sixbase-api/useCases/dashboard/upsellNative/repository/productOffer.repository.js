const Product_offer = require('../../../../database/models/Product_offer');

class ProductOfferRepository {
  static async findOne(props) {
    const { where, values } = props;
    const res = await Product_offer.findOne({
      where,
      raw: true,
      ...(values && { attributes: values }),
      include: [
        {
          association: 'offer_product',
          required: true,
          attributes: ['id', 'id_user', 'name', 'description', 'cover'],
        },
        {
          association: 'plans',
          attributes: [
            'uuid',
            'price',
            'label',
            'frequency_label',
            'subscription_fee',
            'subscription_fee_price',
            'charge_first',
          ],
        },
      ],
    });
    return res;
  }

  static async findAll(props) {
    const { where, values } = props;
    const res = await Product_offer.findAll({
      where,
      raw: true,
      nest: true,
      subQuery: false,
      ...(values && { attributes: values }),
      include: [
        {
          association: 'offer_product',
          required: true,
          attributes: ['id', 'id_user', 'name', 'description', 'cover'],
        },
        {
          association: 'plans',
          attributes: [
            'uuid',
            'price',
            'label',
            'frequency_label',
            'subscription_fee',
            'subscription_fee_price',
            'charge_first',
          ],
        },
      ],
    });
    return res;
  }

  static async update(props) {
    const { where, data } = props;
    const res = await Product_offer.update(data, {
      where,
    });
    return res;
  }
}

module.exports = { ProductOfferRepository };
