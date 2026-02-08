const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Order_bumps extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        id_offer: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        order_bump_offer: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        product_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        label: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        price_before: {
          type: Sequelize.DECIMAL(20, 2),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        show_quantity: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        max_quantity: {
          type: Sequelize.INTEGER,
        },
        cover: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cover_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        order_bump_plan: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      },
      {
        hooks: {
          beforeCreate: (order_bump) => {
            order_bump.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'order_bumps',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.product_offer, {
      sourceKey: 'order_bump_offer',
      foreignKey: 'id',
      as: 'offer',
    });
  }
}

module.exports = Order_bumps;
