const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Plugins extends Sequelize.Model {
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
          allowNull: false,
        },
        id_plugin: {
          type: Sequelize.INTEGER,
        },
        settings: {
          type: Sequelize.JSON,
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
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        start_date: {
          type: Sequelize.DATE,
        },
        is_affiliate: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_supplier: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        id_external_notazz: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
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
        modelName: 'plugins',
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
  }
}

module.exports = Plugins;
