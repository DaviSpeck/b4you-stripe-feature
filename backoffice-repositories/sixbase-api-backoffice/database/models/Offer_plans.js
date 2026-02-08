const Sequelize = require('sequelize');

class Offer_plans extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_offer: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_plan: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'offer_plans',
      },
    );

    return this;
  }
}

module.exports = Offer_plans;
