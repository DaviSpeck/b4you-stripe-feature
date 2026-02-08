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
}
