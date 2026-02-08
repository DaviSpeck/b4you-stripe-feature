import * as Sequelize from 'sequelize';

export class Sales extends Sequelize.Model {
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
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        params: {
          type: Sequelize.JSON,
        },
        address: {
          type: Sequelize.JSON,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_order_bling: {
          type: Sequelize.BIGINT,
        },
        id_order_tiny: {
          type: Sequelize.BIGINT,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'sales',
        individualHooks: true,
      }
    );

    return Sales;
  }

  static associate(models) {
    Sales.hasMany(models.sales_items, {
      foreignKey: 'id_sale',
      as: 'sales_items',
    });
    Sales.belongsTo(models.students, {
      foreignKey: 'id_student',
      as: 'student',
    });
  }
}
