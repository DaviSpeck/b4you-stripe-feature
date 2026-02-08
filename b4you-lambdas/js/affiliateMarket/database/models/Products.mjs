import * as Sequelize from 'sequelize';

export class Products extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        id_type: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        name: {
          type: Sequelize.STRING,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        files_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        excerpt: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        category: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        payment_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        content_delivery: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cover: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cover_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ebook_cover: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ebook_cover_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sidebar_picture: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sidebar_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        header_picture: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        header_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        thumbnail: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        thumbnail_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        warranty: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        sales_page_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        support_email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        support_whatsapp: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        nickname: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        biography: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        logo: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        logo_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        hex_color: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        creditcard_descriptor: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        visible: {
          allowNull: true,
          type: Sequelize.BOOLEAN,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        certificate: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        certificate_key: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        allow_affiliate: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        list_on_market: {
          type: Sequelize.BOOLEAN,
        },
        folder_uri: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        checkout_description: {
          type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
        },
        header_picture_mobile: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        header_picture_mobile_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        favicon: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        favicon_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_status_market: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'products',
        underscored: true,
        paranoid: true,
      }
    );

    return this;
  }
  static associate(models) {
    this.hasOne(models.product_affiliate_settings, {
      foreignKey: 'id_product',
      as: 'affiliate_settings',
    });
    this.hasMany(models.product_offer, {
      foreignKey: 'id_product',
      as: 'product_offer',
    });
    this.hasMany(models.product_images, {
      foreignKey: 'id_product',
      as: 'affiliate_images',
    });
  }
}
