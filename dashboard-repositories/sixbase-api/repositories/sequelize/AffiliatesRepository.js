const Affiliates = require('../../database/models/Affiliates');

module.exports = class AffiliateRepository {
  static async find(where) {
    const affiliate = await Affiliates.findOne({
      nest: true,
      where,
      include: [
        {
          association: 'product',
          include: [
            { association: 'affiliate_settings' },
            {
              association: 'producer',
            },
          ],
        },
        {
          association: 'user',
          include: [
            {
              association: 'user_sale_settings',
            },
          ],
        },
      ],
    });
    return affiliate;
  }
};
