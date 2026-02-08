const Sequelize = require('sequelize');

class Study_history extends Sequelize.Model {
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
        id_module: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_lesson: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        time: {
          type: Sequelize.INTEGER,
        },
        done: {
          type: Sequelize.BOOLEAN,
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
        modelName: 'study_history',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.products, {
      sourceKey: 'id_product',
      foreignKey: 'id',
      as: 'product',
    });
  }
}

module.exports = Study_history;
