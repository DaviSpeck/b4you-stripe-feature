const Sequelize = require('sequelize');

class Modules_Classrooms extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_classroom: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_module: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'modules_classrooms',
      },
    );

    return this;
  }
}

module.exports = Modules_Classrooms;
