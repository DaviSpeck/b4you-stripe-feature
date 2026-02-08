const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Email_notifications extends Sequelize.Model {
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
        id_type: {
          type: Sequelize.BIGINT,
        },
        id_student: {
          type: Sequelize.BIGINT,
        },
        id_producer: {
          type: Sequelize.BIGINT,
        },
        variables: {
          type: Sequelize.JSON,
        },
        details: {
          type: Sequelize.STRING,
        },
        message_uuid: {
          type: Sequelize.STRING,
        },
        message_id: {
          type: Sequelize.STRING,
        },
        status: {
          type: Sequelize.STRING,
        },
        sent_at: Sequelize.DATE,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      },
      {
        hooks: {
          beforeCreate: (email_notifications) => {
            email_notifications.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'email_notifications',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.students, {
      foreignKey: 'id_student',
      as: 'student',
    });
    this.belongsTo(models.users, {
      foreignKey: 'id_producer',
      as: 'producer',
    });
  }
}

module.exports = Email_notifications;
