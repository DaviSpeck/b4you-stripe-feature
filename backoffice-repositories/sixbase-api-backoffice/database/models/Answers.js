const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Answers extends Sequelize.Model {
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
        id_question: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_student: {
          type: Sequelize.BIGINT,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        team_member: {
          type: Sequelize.BIGINT,
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
          beforeCreate: (answer) => {
            answer.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'answers',
        paranoid: true,
        underscored: true,
      },
    );

    return this;
  }

  static associate(models) {
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
  }
}

module.exports = Answers;
