const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Lesson_notes extends Sequelize.Model {
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
        title: {
          type: Sequelize.STRING,
        },
        note: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (invoice) => {
            invoice.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'lesson_notes',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.products, {
      sourceKey: 'id_product',
      foreignKey: 'id',
      as: 'product',
    });
    this.belongsTo(models.students, {
      sourceKey: 'id_student',
      foreignKey: 'id',
      as: 'student',
    });
    this.belongsTo(models.lessons, {
      sourceKey: 'id_lesson',
      foreignKey: 'id',
      as: 'lesson',
    });
  }
}

module.exports = Lesson_notes;
