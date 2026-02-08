const Sequelize = require('sequelize');

class Offers_upsell_native extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        upsell_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        offer_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'offers_upsell_native',
      },
    );

    return this;
  }
}

module.exports = Offers_upsell_native;
