import * as Sequelize from 'sequelize';

export class StudentProducts extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_classroom: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        is_bonus: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'student_products',
      }
    );

    return this;
  }
}
