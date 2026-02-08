const Sequelize = require('sequelize');

class Lesson_comments extends Sequelize.Model {
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
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },
        id_lesson: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        auto_approved: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        approved_by: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        approved_at: {
          type: Sequelize.DATE,
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
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'lesson_comments',
        underscored: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.products, {
      foreignKey: 'id_product',
      as: 'product',
    });
    this.belongsTo(models.lessons, {
      foreignKey: 'id_lesson',
      as: 'lesson',
    });
    this.belongsTo(models.students, {
      foreignKey: 'id_student',
      as: 'student',
    });
    this.belongsTo(models.users, {
      foreignKey: 'approved_by',
      as: 'moderator',
    });
  }
}

module.exports = Lesson_comments;

