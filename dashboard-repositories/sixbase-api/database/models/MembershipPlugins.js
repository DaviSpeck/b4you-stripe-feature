const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

module.exports = class MembershipPlugins extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
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
        modelName: 'membership_plugins',
      },
    );

    return this;
  }
};
