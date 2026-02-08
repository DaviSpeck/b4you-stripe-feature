const Sequelize = require('sequelize');

class Questions_history extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_question: {
          type: Sequelize.BIGINT,
        },
        title: {
          type: Sequelize.STRING,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
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
        sequelize,
        modelName: 'questions_history',
      },
    );

    return this;
  }

  //   static associate(models) {}
}

module.exports = Questions_history;
