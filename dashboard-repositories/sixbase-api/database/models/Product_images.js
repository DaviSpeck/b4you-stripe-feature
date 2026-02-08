const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

module.exports = class ProductImages extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_product: {
          type: Sequelize.BIGINT,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        id_type: {
          type: Sequelize.INTEGER,
        },
        file: {
          type: Sequelize.STRING,
        },
        key: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
      },
      {
        hooks: {
          beforeCreate: (product_images) => {
            product_images.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'product_images',
        underscored: true,
        updatedAt: false,
        deletedAt: false,
        createdAt: 'created_at',
      },
    );

    return this;
  }
};
