const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Lessons extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_module: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_gallery: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING,
        },
        description: {
          type: `${Sequelize.TEXT} CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        },
        order: {
          type: Sequelize.INTEGER,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        release: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (lesson) => {
            lesson.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        sequelize,
        modelName: 'lessons',
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.lessons_attachments, {
      as: 'attachments',
      foreignKey: 'id_lesson',
    });
    this.hasOne(models.study_history, {
      as: 'study_history',
      foreignKey: 'id_lesson',
    });
    this.hasOne(models.modules, {
      as: 'module',
      sourceKey: 'id_module',
      foreignKey: 'id',
    });
    this.hasOne(models.product_gallery, {
      foreignKey: 'id',
      sourceKey: 'id_gallery',
      as: 'video',
    });
  }
}

module.exports = Lessons;
