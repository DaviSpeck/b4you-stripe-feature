const Sequelize = require('sequelize');

class Onboarding extends Sequelize.Model {
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
        signup_reason: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        has_sold: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        platform: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        revenue: {
          type: Sequelize.SMALLINT,
          defaultValue: 0,
        },
        user_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        nicho_other: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        business_model_other: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        origem_other: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        has_experience_as_creator_or_affiliate: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        nicho: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        audience_size: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        origem: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        business_model: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        company_size: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        worked_with_affiliates: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        invested_in_affiliates: {
          type: Sequelize.SMALLINT,
          allowNull: true,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'onboarding',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
  }
}

module.exports = Onboarding;
