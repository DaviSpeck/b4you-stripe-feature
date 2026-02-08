import * as Sequelize from 'sequelize';

export class ReferralCommissions extends Sequelize.Model {
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
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_status: {
          type: Sequelize.TINYINT.UNSIGNED,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'sales_items',
            key: 'id',
          },
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        release_date: {
          type: Sequelize.DATEONLY,
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
        underscored: true,
        sequelize,
        modelName: 'referral_commissions',
      }
    );

    return this;
  }
}
