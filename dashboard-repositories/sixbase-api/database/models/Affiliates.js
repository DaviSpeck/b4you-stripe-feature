  const Sequelize = require('sequelize');
  const uuid = require('../../utils/helpers/uuid');

  class Affiliates extends Sequelize.Model {
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
          id_product: {
            type: Sequelize.BIGINT,
            allowNull: false,
          },
          commission: {
            type: Sequelize.DECIMAL(10, 2),
          },
          subscription_fee: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          subscription_fee_only: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          subscription_fee_commission: {
            type: Sequelize.DECIMAL(10, 2),
          },
          commission_all_charges: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          status: {
            type: Sequelize.INTEGER,
          },
          created_at: {
            type: Sequelize.DATE,
          },
          updated_at: {
            type: Sequelize.DATE,
          },
          deleted_at: {
            type: Sequelize.BIGINT,
          },
          uuid: {
            type: Sequelize.UUID,
            unique: true,
          },
          allow_access: { type: Sequelize.BOOLEAN, defaultValue: false },
          id_manager: {
            type: Sequelize.BIGINT,
            allowNull: true,
            defaultValue: true,
          },
        },
        {
          hooks: {
            beforeCreate: (affiliate) => {
              affiliate.uuid = uuid.nanoid(10);
            },
          },
          paranoid: true,
          freezeTableName: true,
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          deletedAt: 'deleted_at',
          sequelize,
          modelName: 'affiliates',
        },
      );

      return this;
    }

    static associate(models) {
      this.belongsTo(models.products, {
        foreignKey: 'id_product',
        as: 'product',
      });
      this.belongsTo(models.users, {
        foreignKey: 'id_user',
        as: 'user',
      });
      this.hasOne(models.managers, {
        sourceKey: 'id_manager',
        foreignKey: 'id',
        as: 'manager',
      });
    }
  }

  module.exports = Affiliates;
