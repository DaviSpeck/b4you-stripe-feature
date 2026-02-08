const Sequelize = require('sequelize');

class form_questions extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_form: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        key: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
        label: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        options: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        required: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        visible_if: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        help_text: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        placeholder: {
          type: Sequelize.STRING(200),
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
        modelName: 'form_questions',
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

module.exports = form_questions;