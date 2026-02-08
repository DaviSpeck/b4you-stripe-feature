const Sequelize = require('sequelize');

class Forms extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        form_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        version: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
        modelName: 'forms',
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
    this.hasMany(models.form_questions, {
      foreignKey: 'id_form',
      as: 'questions',
    });
  }
}

module.exports = Forms;