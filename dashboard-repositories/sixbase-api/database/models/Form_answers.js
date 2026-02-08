const Sequelize = require('sequelize');

class form_answers extends Sequelize.Model {
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
        id_form: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        key: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
        value: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        sequelize,
        modelName: 'form_answers',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: false,
      },
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.forms, {
      foreignKey: 'id_form',
      as: 'form',
    });
  }
}

module.exports = form_answers;