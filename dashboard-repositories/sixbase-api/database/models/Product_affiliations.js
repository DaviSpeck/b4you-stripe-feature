const Sequelize = require('sequelize');

module.exports = class Product_affiliations extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        id_product_affiliation: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'product_affiliations',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.products, {
      as: 'product_affiliation',
      sourceKey: 'id_product_affiliation',
      foreignKey: 'id',
    });
  }
};
