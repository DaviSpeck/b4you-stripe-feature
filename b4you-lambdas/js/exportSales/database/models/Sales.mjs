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
        full_name: Sequelize.STRING,
        email: Sequelize.STRING,
        whatsapp: Sequelize.STRING,
        document_number: Sequelize.STRING,
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
    this.hasOne(models.coupons_sales, {
      foreignKey: 'id_sale',
      sourceKey: 'id',
      as: 'coupon_sale',
    });
  }
}
