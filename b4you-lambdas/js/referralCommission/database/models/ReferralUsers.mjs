import * as Sequelize from "sequelize";

export class ReferralUsers extends Sequelize.Model {
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
            model: "users",
            key: "id",
          },
        },
        id_referral_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        created_at: {
          type: Sequelize.DATE,
        },
        valid_until: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        updatedAt: false,
        underscored: true,
        sequelize,
        modelName: "referral_users",
      }
    );

    return this;
  }
}
