const Sequelize = require('sequelize');

module.exports = class UserHistory extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        params: {
          type: Sequelize.JSON,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
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
        deletedAt: 'deleted_at',
        paranoid: true,
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'user_history',
      },
    );

    return this;
  }
};
