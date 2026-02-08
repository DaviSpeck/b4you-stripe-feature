const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

module.exports = class ProductPages extends Sequelize.Model {
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
        uuid: {
          type: Sequelize.UUID,
        },
        label: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        id_type: {
          type: Sequelize.INTEGER,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (page) => {
            page.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'product_pages',
        underscored: true,
        paranoid: true,
        updatedAt: false,
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
  }
};
