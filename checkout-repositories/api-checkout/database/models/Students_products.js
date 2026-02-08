const Sequelize = require('sequelize');

class Student_products extends Sequelize.Model {
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
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.students, {
      sourceKey: 'id_student',
      foreignKey: 'id',
      as: 'student',
    });
    this.hasOne(models.products, {
      sourceKey: 'id_product',
      foreignKey: 'id',
      as: 'product',
    });
    this.hasOne(models.classrooms, {
      sourceKey: 'id_classroom',
      foreignKey: 'id',
      as: 'classroom',
    });
    this.hasMany(models.study_history, {
      sourceKey: 'id_student',
      foreignKey: 'id_student',
      as: 'study_history',
    });
  }
}

module.exports = Student_products;