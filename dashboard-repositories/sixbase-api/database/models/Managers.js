const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

module.exports = class Managers extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.BIGINT,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_status: {
          type: Sequelize.TINYINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        commission_type: {
          type: Sequelize.STRING,
        },
        commission_without_affiliate: {
          type: Sequelize.DECIMAL(10, 2),
        },
        commission_with_affiliate: {
          type: Sequelize.DECIMAL(10, 2),
        },
        allow_share_link: {
          type: Sequelize.BOOLEAN,
        },
        type: { type: Sequelize.STRING, defaultValue: 'not-all' },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
        rejected_at: Sequelize.DATE,
      },
      {
        hooks: {
          beforeCreate: async (manager) => {
            manager.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
        sequelize,
        modelName: 'managers',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      as: 'user',
      sourceKey: 'id_user',
      foreignKey: 'id',
    });
    this.hasOne(models.products, {
      as: 'product',
      sourceKey: 'id_product',
      foreignKey: 'id',
    });
  }
};
