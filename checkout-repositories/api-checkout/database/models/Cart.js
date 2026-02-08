const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Cart extends Sequelize.Model {
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
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        full_name: {
          type: Sequelize.STRING,
        },
        document_number: {
          type: Sequelize.STRING,
        },
        whatsapp: {
          type: Sequelize.STRING,
        },
        abandoned: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: null,
        },
        address: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        },
        coupon: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        hooks: {
          beforeCreate: (cart) => {
            cart.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        modelName: 'cart',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.sales_items, {
      foreignKey: 'id',
      sourceKey: 'id_sale_item',
      as: 'sale_item',
    });
    this.hasOne(models.product_offer, {
      foreignKey: 'id',
      sourceKey: 'id_offer',
      as: 'offer',
    });
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
  }
}

module.exports = Cart;
