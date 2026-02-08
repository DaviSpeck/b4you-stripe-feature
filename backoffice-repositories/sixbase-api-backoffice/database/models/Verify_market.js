const Sequelize = require('sequelize');

class Verify_market extends Sequelize.Model {
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
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        id_status: {
          type: Sequelize.BIGINT,
        },
        reason: {
          type: Sequelize.TEXT,
        },
        manager_link: {
          type: Sequelize.TEXT,
        },
        internal_descriptions: {
          type: Sequelize.TEXT,
        },
        requested_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
        rejected_at: Sequelize.DATE,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        sequelize,
        modelName: 'verify_market',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.products, {
      sourceKey: 'id_product',
      foreignKey: 'id',
      as: 'products',
    });
    this.hasOne(models.users, {
      sourceKey: 'id_user',
      foreignKey: 'id',
      as: 'users',
    });
  }
}

module.exports = Verify_market;
