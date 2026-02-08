const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Sales extends Sequelize.Model {
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
        id_invoice: {
          type: Sequelize.BIGINT,
        },
        id_invoice_affiliate: {
          type: Sequelize.BIGINT,
          defaultValue: null,
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
        fb_pixel_info: {
          type: Sequelize.JSON,
          defaultValue: null,
        },
        id_order_notazz: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        id_invoice_supplier: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        id_bling_invoice: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        state_generated: {
          type: Sequelize.STRING(4),
        },
        score_konduto: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
          allowNull: true,
        },
        id_konduto: {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
        },
      },
      {
        hooks: {
          beforeCreate: (sale) => {
            sale.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'sales',
        individualHooks: true,

        indexes: [
          { name: 'idx_sales_id_user', fields: ['id_user'] },
          { name: 'idx_sales_state_generated', fields: ['state_generated'] },
        ],
      },
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.sales_items, {
      foreignKey: 'id_sale',
      as: 'products',
    });
    this.hasOne(models.students, {
      foreignKey: 'id',
      sourceKey: 'id_student',
      as: 'student',
    });
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
  }
}

module.exports = Sales;
