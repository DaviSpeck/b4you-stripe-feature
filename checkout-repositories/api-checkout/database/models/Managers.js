const Sequelize = require('sequelize');

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
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
        rejected_at: Sequelize.DATE,
      },
      {
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
};
