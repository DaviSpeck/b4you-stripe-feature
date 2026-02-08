const Sequelize = require('sequelize');

class Balance_history extends Sequelize.Model {
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
        id_transaction: {
          type: Sequelize.BIGINT,
        },
        operation: {
          type: Sequelize.STRING,
        },
        old_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        new_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
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
        modelName: 'balance_history',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'producer',
    });
    this.hasOne(models.transactions, {
      foreignKey: 'id',
      sourceKey: 'id_transaction',
      as: 'transaction',
    });
  }
}

module.exports = Balance_history;
