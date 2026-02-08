import * as Sequelize from "sequelize";

export class Sales_items extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_plan: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        price: {
          type: Sequelize.DECIMAL(20, 2),
          allowNull: false,
        },
        is_upsell: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        payment_method: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        paid_at: {
          type: Sequelize.DATE,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        valid_refund_until: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        payment_splited: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        credit_card: {
          type: Sequelize.JSON,
        },
        src: {
          type: Sequelize.STRING,
        },
        sck: {
          type: Sequelize.STRING,
        },
        utm_source: {
          type: Sequelize.STRING,
        },
        utm_medium: {
          type: Sequelize.STRING,
        },
        utm_campaign: {
          type: Sequelize.STRING,
        },
        utm_content: {
          type: Sequelize.STRING,
        },
        utm_term: {
          type: Sequelize.STRING,
        },
        quantity: {
          type: Sequelize.INTEGER,
        },
        id_offer: {
          type: Sequelize.BIGINT,
        },
      },
      {
        hooks: {
          beforeCreate: (saleItem) => {
            saleItem.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        sequelize,
        modelName: "sales_items",
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.products, {
      foreignKey: "id",
      sourceKey: "id_product",
      as: "product",
    });
    this.hasOne(models.students, {
      foreignKey: "id",
      sourceKey: "id_student",
      as: "student",
    });
    this.belongsTo(models.sales, {
      foreignKey: "id_sale",
      as: "sale",
    });
  }
}
