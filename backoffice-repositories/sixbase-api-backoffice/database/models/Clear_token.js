const Sequelize = require('sequelize');

class Clear_token extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          field: 'id',
        },
        token: {
          type: Sequelize.TEXT,
        },
        expires_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
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
        deletedAt: false,
        sequelize,
        modelName: 'clear_token',
      },
    );

    return this;
  }
}

module.exports = Clear_token;
