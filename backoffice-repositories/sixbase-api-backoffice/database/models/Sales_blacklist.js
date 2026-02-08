const Sequelize = require('sequelize');

class Sales_blacklist extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        id_blacklist: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.SMALLINT,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
        transaction_id: {
          type: Sequelize.STRING,
        },
        antifraud_response: {
          type: Sequelize.JSON,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'sales_blacklist',
        individualHooks: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.sales, {
      sourceKey: 'id_sale',
      foreignKey: 'id',
      as: 'sale',
    });
    this.hasOne(models.blacklist, {
      sourceKey: 'id_blacklist',
      foreignKey: 'id',
      as: 'blacklist',
    });
  }
}

module.exports = Sales_blacklist;
