import * as Sequelize from 'sequelize';

export class Charges extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_sale: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_nfse: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        psp_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        price: {
          type: Sequelize.FLOAT(20, 2),
          allowNull: false,
        },
        due_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        payment_method: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        installments: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        billet_code: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        pix_code: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        line_code: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        billet_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        paid_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        id_subscription: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        next_business_day: {
          type: Sequelize.DATEONLY,
        },
        last_notification: {
          type: Sequelize.DATE,
        },
        count_notification: {
          type: Sequelize.INTEGER,
        },
        qrcode_url: {
          type: Sequelize.STRING,
        },
        provider: {
          type: Sequelize.STRING,
        },
        provider_id: {
          type: Sequelize.STRING,
        },
        psp_cost_variable_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        psp_cost_variable_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        psp_cost_fixed_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        psp_cost_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        revenue: {
          type: Sequelize.DECIMAL(10, 2),
        },
        interest_installment_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        interest_installment_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        user_gross_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        user_net_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        company_gross_profit_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_fee_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_fee_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_interest_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_interest_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        company_net_profit_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        spread_over_price_total_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        discount_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        discount_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'charges',
      }
    );

    return this;
  }

}
