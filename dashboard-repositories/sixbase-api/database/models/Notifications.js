const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Notifications extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        id_student: {
          type: Sequelize.BIGINT,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        key: {
          type: Sequelize.STRING,
        },
        variant: {
          type: Sequelize.STRING,
        },
        params: {
          type: Sequelize.JSON,
        },
        read: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        read_at: {
          type: Sequelize.DATE,
        },

        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (notification) => {
            notification.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'read_at',
        sequelize,
        modelName: 'notifications',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      sourceKey: 'id_user',
      foreignKey: 'id',
      as: 'producer',
    });
    this.hasOne(models.students, {
      sourceKey: 'id_student',
      foreignKey: 'id',
      as: 'student',
    });
  }
}

module.exports = Notifications;
