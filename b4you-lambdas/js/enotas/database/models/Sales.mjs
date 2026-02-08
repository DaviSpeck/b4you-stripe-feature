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
        full_name: {
          type: Sequelize.STRING,
        },
        document_number: {
          type: Sequelize.STRING,
        },
        email: {
          type: Sequelize.STRING,
        },
        whatsapp: {
          type: Sequelize.STRING,
        },
        id_invoice: {
          type: Sequelize.BIGINT,
        },
        id_invoice_affiliate: {
          type: Sequelize.BIGINT,
          defaultValue: null,
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

    return this;
  }

  static associate(models) {
    this.hasMany(models.sales_items, {
      foreignKey: 'id_sale',
      as: 'sales_items',
    });
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
  }
}
