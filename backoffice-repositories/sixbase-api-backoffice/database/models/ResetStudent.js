const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class ResetStudent extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (reset) => {
            reset.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'reset_student',
        individualHooks: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.students, {
      sourceKey: 'id_student',
      foreignKey: 'id',
      as: 'student',
    });
  }
}

module.exports = ResetStudent;
