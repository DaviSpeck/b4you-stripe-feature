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
}

module.exports = Plugins;
