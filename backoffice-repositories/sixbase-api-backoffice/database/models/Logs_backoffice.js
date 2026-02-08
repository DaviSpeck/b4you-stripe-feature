const Sequelize = require('sequelize');

class Logs_backoffice extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user_backoffice: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_event: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        params: {
          type: Sequelize.JSON,
        },
        ip_address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'logs_backoffice',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users_backoffice, {
      as: 'user',
      sourceKey: 'id_user_backoffice',
      foreignKey: 'id',
    });
    this.hasOne(models.users, {
      as: 'user_client',
      sourceKey: 'id_user',
      foreignKey: 'id',
    });
  }
}

module.exports = Logs_backoffice;
