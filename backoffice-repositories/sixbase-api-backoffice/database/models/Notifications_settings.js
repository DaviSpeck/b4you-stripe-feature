const Sequelize = require('sequelize');

class Notifications_settings extends Sequelize.Model {
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
        show_product_name: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        generated_pix: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        generated_billet: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        paid_pix: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        paid_billet: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        paid_card: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        expired_pix: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        expired_billet: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'notifications_settings',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      sourceKey: 'id_user',
      foreignKey: 'id',
      as: 'user',
    });
  }
}

module.exports = Notifications_settings;
