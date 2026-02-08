const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Products_gallery extends Sequelize.Model {
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
          unique: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        duration: {
          type: Sequelize.INTEGER.UNSIGNED,
          defaultValue: 0,
        },
        uri: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        link: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        upload_link: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        thumbnail: {
          type: Sequelize.STRING,
        },
        video_status: {
          type: Sequelize.SMALLINT,
          allowNull: true,
          defaultValue: 0,
        },
        video_uploaded: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (gallery) => {
            gallery.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'product_gallery',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.lessons, {
      as: 'lessons',
      foreignKey: 'id_gallery',
      sourceKey: 'id',
    });

    this.belongsTo(models.products, {
      as: 'product',
      foreignKey: 'id_product',
    });
  }
}

module.exports = Products_gallery;
