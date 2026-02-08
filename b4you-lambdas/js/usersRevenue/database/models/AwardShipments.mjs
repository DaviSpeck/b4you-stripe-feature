import * as Sequelize from 'sequelize';

export class AwardShipments extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        producer_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        milestone: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('pending', 'sent'),
          allowNull: false,
          defaultValue: 'pending',
        },
        tracking_code: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        tracking_link: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        achieved_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        sent_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'award_shipments',
      },
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.users, {
      sourceKey: 'producer_id',
      foreignKey: 'id_user',
      as: 'producer',
    });
  }
}