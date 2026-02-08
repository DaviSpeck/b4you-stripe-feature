const Sequelize = require('sequelize');

class Cookies_jar extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        sixid: {
          type: Sequelize.STRING,
        },
        id_offer: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        max_age: Sequelize.DATE,
        created_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        updatedAt: false,
        sequelize,
        modelName: 'cookies_jar',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.affiliates, {
      sourceKey: 'id_affiliate',
      foreignKey: 'id',
      as: 'affiliate',
    });
  }
}

module.exports = Cookies_jar;
