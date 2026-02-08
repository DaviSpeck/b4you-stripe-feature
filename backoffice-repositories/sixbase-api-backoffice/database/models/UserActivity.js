const Sequelize = require('sequelize');

class User_activity extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id_user: {
          type: Sequelize.BIGINT,
        },
        amount: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        id_type: {
          type: Sequelize.INTEGER,
        },
        reason: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'user_activity',
      },
    );

    return this;
  }
}

module.exports = User_activity;
