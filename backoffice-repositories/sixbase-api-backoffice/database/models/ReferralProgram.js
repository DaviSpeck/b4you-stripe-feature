const Sequelize = require('sequelize');

module.exports = class ReferralProgram extends Sequelize.Model {
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
        percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        id_status: {
          type: Sequelize.TINYINT.UNSIGNED,
        },
        code: {
          type: Sequelize.STRING(12),
          unique: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        canceled_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'referral_program',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id_user',
      as: 'user',
    });
  }
};
