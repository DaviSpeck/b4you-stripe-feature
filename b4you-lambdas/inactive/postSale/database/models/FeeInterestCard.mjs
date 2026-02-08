import * as Sequelize from 'sequelize';
export class Fee_interest_card extends Sequelize.Model {
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
          unique: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        is_default: {
          type: Sequelize.BOOLEAN,
        },
        producer_fees: {
          type: Sequelize.JSON,
        },
        student_fees: {
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
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'fee_interest_card',
      }
    );

    return this;
  }
}
