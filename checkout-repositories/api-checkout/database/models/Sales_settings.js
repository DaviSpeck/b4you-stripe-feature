const Sequelize = require('sequelize');

class Sales_settings extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        fee_fixed_billet: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_billet: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_card: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_pix: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_pix: {
          type: Sequelize.DECIMAL(10, 2),
        },
        release_billet: {
          type: Sequelize.INTEGER,
        },
        release_credit_card: {
          type: Sequelize.INTEGER,
        },
        release_pix: {
          type: Sequelize.INTEGER,
        },
        fee_variable_percentage_service: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
          allowNull: false,
        },
        fee_fixed_amount_service: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
          allowNull: false,
        },
        fee_fixed_refund_card: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        fee_fixed_refund_billet: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        fee_fixed_refund_pix: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        fee_fixed_pix_service: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_billet_service: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_card_service: {
          type: Sequelize.JSON,
        },
        fee_variable_pix_service: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_billet_service: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_card_service: {
          type: Sequelize.JSON,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'sales_settings',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.users, {
      foreignKey: 'id_user',
      as: 'user_sale_settings',
    });

    this.hasOne(models.fee_interest_card, {
      foreignKey: 'id_user',
      sourceKey: 'id_user',
      as: 'fee_interest_card',
    });
  }
}

module.exports = Sales_settings;
