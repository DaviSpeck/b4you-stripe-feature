const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Products_ebooks extends Sequelize.Model {
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
        name: {
          type: Sequelize.STRING,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        ebook_file: {
          type: Sequelize.STRING,
        },
        ebook_key: {
          type: Sequelize.STRING,
        },
        file_size: Sequelize.BIGINT,
        file_extension: Sequelize.STRING(10),
        is_bonus: {
          type: Sequelize.BOOLEAN,
        },
        allow_piracy_watermark: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        hooks: {
          beforeCreate: (product) => {
            product.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'products_ebooks',
      },
    );

    return this;
  }
}

module.exports = Products_ebooks;
