import * as Sequelize from 'sequelize';

export class Sales_blacklist extends Sequelize.Model {
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
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'sales_blacklist',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    return this;
  }
  static associate(models) {
    this.belongsTo(models.sales, {
      sourceKey: 'id_sale',
      foreignKey: 'id',
      as: 'sale',
    });
  }
}
