const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Questions extends Sequelize.Model {
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
        id_student: {
          type: Sequelize.BIGINT,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_module: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_lesson: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        team_member: {
          type: Sequelize.BIGINT,
          allowNull: true,
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
          beforeCreate: (question) => {
            question.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'questions',
        individualHooks: true,
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.questions_history, {
      foreignKey: 'id_question',
      as: 'history',
    });
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'producer',
    });
    this.hasOne(models.students, {
      foreignKey: 'id',
      sourceKey: 'id_student',
      as: 'student',
    });
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'team_member',
      as: 'collaborator',
    });
    this.hasMany(models.answers, {
      foreignKey: 'id_question',
      as: 'answers',
    });
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
    this.hasOne(models.modules, {
      foreignKey: 'id',
      sourceKey: 'id_module',
      as: 'module',
    });
    this.hasOne(models.lessons, {
      foreignKey: 'id',
      sourceKey: 'id_lesson',
      as: 'lesson',
    });
  }
}

module.exports = Questions;
