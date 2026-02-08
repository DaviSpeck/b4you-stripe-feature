import * as Sequelize from 'sequelize';

export class Clients extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        provider_external_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        id_provider: {
          type: Sequelize.TINYINT,
          allowNull: false,
        },
        document_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
        },
        address: {
          type: Sequelize.JSON,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: false,
        sequelize,
        modelName: 'clients',
      }
    );

    return this;
  }
}
