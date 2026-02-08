const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class AffiliateClicks extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
        },
        id_producer: {
          type: Sequelize.BIGINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        id_offer: {
          type: Sequelize.BIGINT,
        },
        click_amount: {
          type: Sequelize.INTEGER,
        },
      },
      {
        hooks: {
          beforeCreate: (affiliateClick) => {
            affiliateClick.uuid = uuid.nanoid(10);
          },
        },
        sequelize,
        timestamps: true,
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'affiliate_clicks',
      },
    );
    return this;
  }
}

module.exports = AffiliateClicks;
