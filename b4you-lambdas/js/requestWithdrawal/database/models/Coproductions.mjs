import * as Sequelize from 'sequelize';

export class Coproductions extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.INTEGER,
        },
        id_user: {
          type: Sequelize.INTEGER,
        },
        id_invite: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        split_invoice: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        commission_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        status: {
          type: Sequelize.INTEGER,
        },
        expires_at: {
          type: Sequelize.DATEONLY,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        accepted_at: {
          type: Sequelize.DATE,
        },
        rejected_at: {
          type: Sequelize.DATE,
        },
        canceled_at: {
          type: Sequelize.DATE,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        warning_one_day: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        warning_seven_days: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'coproductions',
      }
    );

    return this;
  }
}
