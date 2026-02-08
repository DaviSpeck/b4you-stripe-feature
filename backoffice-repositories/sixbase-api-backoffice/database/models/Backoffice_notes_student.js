const Sequelize = require('sequelize');

module.exports = class Backoffice_notes_student extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user_backoffice: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_student: {
          type: Sequelize.BIGINT,
        },
        note: {
          type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        updatedAt: false,
        createdAt: 'created_at',
        deletedAt: 'deleted_at',
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'backoffice_notes_student',
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users_backoffice, {
      foreignKey: 'id',
      sourceKey: 'id_user_backoffice',
      as: 'user_backoffice',
    });
  }
};
