const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Student_sessions extends Sequelize.Model {
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
        id_student: {
          type: Sequelize.BIGINT,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (student_sessions) => {
            student_sessions.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        updatedAt: false,
        underscored: true,
        sequelize,
        modelName: 'student_sessions',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.students, {
      foreignKey: 'id',
      sourceKey: 'id_student',
      as: 'student',
    });
  }
}

module.exports = Student_sessions;
