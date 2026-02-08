const Sequelize = require('sequelize');

class Mute_Student extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        id_student: {
          type: Sequelize.BIGINT,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'mute_student',
      },
    );

    return this;
  }

  // static associate(models) {
  //   this.hasOne(models.products, {
  //     as: 'product',
  //     foreignKey: 'id_product',
  //   });
  //   this.hasOne(models.students, {
  //     as: 'student',
  //     foreignKey: 'id_student',
  //   });
  // }
}

module.exports = Mute_Student;
