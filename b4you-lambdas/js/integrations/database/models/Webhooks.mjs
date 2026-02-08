import * as Sequelize from 'sequelize';

export class Webhooks extends Sequelize.Model {
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
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        token: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        events: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: Sequelize.DATE,
        invalid: Sequelize.BOOLEAN,
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'webhooks',
        paranoid: true,
      }
    );

    return this;
  }
}
