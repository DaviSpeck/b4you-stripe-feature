import * as Sequelize from 'sequelize';

export class Refunds extends Sequelize.Model {
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
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        requested_by_student: {
          type: Sequelize.BOOLEAN,
        },
        reason: {
          type: Sequelize.STRING,
        },
        description: {
          type: Sequelize.TEXT,
        },
        api_response: {
          type: Sequelize.JSON,
        },
        bank: {
          type: Sequelize.JSON,
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
        updatedAt: false,
        sequelize,
        modelName: 'refunds',
        individualHooks: true,
      }
    );
    return this;
  }
}
