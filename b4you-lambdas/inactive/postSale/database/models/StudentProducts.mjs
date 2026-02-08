import * as Sequelize from 'sequelize';

export class Student_products extends Sequelize.Model {
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
        has_access: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
