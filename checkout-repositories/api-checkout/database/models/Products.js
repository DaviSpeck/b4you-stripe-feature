const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Products extends Sequelize.Model {
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
        dimensions: {
          type: Sequelize.JSON,
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
        is_upsell_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
        banner: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner_mobile: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner_mobile_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        second_header_mobile: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        second_header_mobile_key: {
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
        anchor_view: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        secure_email: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        second_header: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        second_header_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        id_status_market: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        url_video_checkout: {
          type: Sequelize.TEXT,
        },
        list_on_market: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
      },
      {
        hooks: {
          beforeCreate: (product) => {
            product.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'products',
        underscored: true,
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.product_affiliate_settings, {
      foreignKey: 'id_product',
      as: 'affiliate_settings',
    });
    this.hasMany(models.classrooms, {
      foreignKey: 'id_product',
      as: 'classrooms',
    });
    this.hasMany(models.coproductions, {
      foreignKey: 'id_product',
      as: 'coproductions',
    });
    this.hasMany(models.product_offer, {
      foreignKey: 'id_product',
      as: 'product_offer',
    });
    this.hasMany(models.product_plans, {
      foreignKey: 'id_product',
      as: 'product_plans',
    });
    this.hasMany(models.modules, {
      foreignKey: 'id_product',
      as: 'module',
    });
    this.hasMany(models.anchors, {
      foreignKey: 'id_product',
      as: 'anchors',
    });
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'producer',
    });
    this.hasOne(models.student_progress, {
      foreignKey: 'id_product',
      as: 'progress',
    });
    this.hasMany(models.products_ebooks, {
      foreignKey: 'id_product',
      as: 'ebooks',
    });
    this.hasMany(models.product_gallery, {
      foreignKey: 'id_product',
      as: 'gallery',
    });
    this.hasMany(models.affiliates, {
      foreignKey: 'id_product',
      as: 'affiliates',
    });
    this.hasMany(models.pixels, {
      foreignKey: 'id_product',
      as: 'pixels',
    });
  }
}

module.exports = Products;
