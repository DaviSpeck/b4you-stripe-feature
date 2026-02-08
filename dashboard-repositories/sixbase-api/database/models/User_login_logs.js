const Sequelize = require('sequelize');

class User_login_logs extends Sequelize.Model {
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
          allowNull: false,
        },
        ip: {
          type: Sequelize.STRING,
        },
        params: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        deletedAt: false,
        updatedAt: false,
        createdAt: 'created_at',
        underscored: true,
        sequelize,
        modelName: 'user_login_logs',
      },
    );

    return this;
  }
}

module.exports = User_login_logs;
