const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Plugins_products extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id_product: {
          type: Sequelize.BIGINT,
        },
        id_plugin: {
          type: Sequelize.BIGINT,
        },
        id_rule: {
          type: Sequelize.BIGINT,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        insert_list: {
          type: Sequelize.BOOLEAN,
        },
        settings: {
          type: Sequelize.JSON,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (plugin) => {
            plugin.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'plugins_products',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.products, {
      sourceKey: 'id_product',
      foreignKey: 'id',
      as: 'product',
    });
    this.hasOne(models.plugins, {
      sourceKey: 'id_plugin',
      foreignKey: 'id',
      as: 'plugin',
    });
  }
}

module.exports = Plugins_products;
