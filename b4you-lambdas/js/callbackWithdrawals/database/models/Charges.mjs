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
