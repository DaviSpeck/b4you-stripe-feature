const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Coproduction_invites extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_productor: {
          type: Sequelize.INTEGER,
        },
        id_coproducer: {
          type: Sequelize.INTEGER,
        },
        id_product: {
          type: Sequelize.INTEGER,
        },
        status: {
          type: Sequelize.INTEGER,
        },
        commission_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        expires_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
      },
      {
        hooks: {
          beforeCreate: (withdrawals_settings) => {
            withdrawals_settings.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'coproduction_invites',
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
    this.hasOne(models.users, {
      sourceKey: 'id_productor',
      foreignKey: 'id',
      as: 'users',
    });
    this.hasOne(models.coproductions, {
      sourceKey: 'id',
      foreignKey: 'id_invite',
      as: 'coproduction',
    });
  }
}

module.exports = Coproduction_invites;
