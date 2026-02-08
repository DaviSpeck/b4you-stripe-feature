const Sequelize = require('sequelize');
const SalesItemsTransactions = require('./Sales_items_transactions');

class Transactions extends Sequelize.Model {
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
          defaultValue: Sequelize.UUIDV4,
          unique: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        psp_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        release_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        released: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
        },
        id_charge: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_role: {
          type: Sequelize.TINYINT,
          allowNull: true,
        },
        id_invoice: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        socket_id: {
          type: Sequelize.STRING,
        },
        method: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        withdrawal_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        withdrawal_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        installments: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        monthly_interest_installment: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        card_brand: {
          type: Sequelize.STRING,
        },
        price_product: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        price_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        subscription_fee: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        split_price: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        price_base: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        psp_cost_variable_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        psp_cost_variable_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        psp_cost_fixed_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        psp_cost_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        revenue: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        interest_installment_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        interest_installment_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        fee_variable_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        fee_variable_percentage_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        fee_fixed_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        fee_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        user_gross_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        user_net_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        company_gross_profit_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        tax_fee_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        tax_fee_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        tax_interest_percentage: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        tax_interest_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        tax_total: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        company_net_profit_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        spread_over_price_product: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        spread_over_price_total: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
        },
        discount_percentage: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        discount_amount: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        original_price: {
          type: Sequelize.DECIMAL(14, 2),
          defaultValue: 0,
        },
        withdrawal_type: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'transactions',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
    this.belongsToMany(models.sales_items, {
      through: SalesItemsTransactions,
      foreignKey: 'id_transaction',
    });
    this.hasOne(models.charges, {
      sourceKey: 'id_charge',
      foreignKey: 'id',
      as: 'charge',
    });
  }
}

module.exports = Transactions;
