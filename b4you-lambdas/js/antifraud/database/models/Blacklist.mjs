import * as Sequelize from 'sequelize';

export class Blacklist extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        data: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        id_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_reason: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'blacklist',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    return this;
  }
}
