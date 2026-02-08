const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

module.exports = class Webhooks extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_type: {
          type: Sequelize.INTEGER,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        token: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        events: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: Sequelize.DATE,
        invalid: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_affiliate: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_supplier: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        tries: {
          type: Sequelize.INTEGER,
        },
      },
      {
        hooks: {
          beforeCreate: async (webhook) => {
            webhook.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'webhooks',
        paranoid: true,
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
};
