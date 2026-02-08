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
        },
        order_bump_plan: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cover: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        product_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        max_quantity: {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
        /* is_selected: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        }, */
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

    this.belongsTo(models.product_plans, {
      foreignKey: 'order_bump_plan',
      targetKey: 'uuid',
      as: 'plan_details',
    });
  }
}

module.exports = Order_bumps;
