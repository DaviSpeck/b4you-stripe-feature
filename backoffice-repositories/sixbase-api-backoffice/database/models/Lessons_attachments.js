const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Lessons_attachments extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_lesson: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        original_name: {
          type: Sequelize.STRING,
        },
        file: {
          type: Sequelize.STRING,
        },
        file_key: {
          type: Sequelize.STRING,
        },
        file_size: {
          type: Sequelize.BIGINT,
        },
        file_extension: {
          type: Sequelize.STRING(10),
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (attachment) => {
            attachment.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'lessons_attachments',
      },
    );

    return this;
  }
}

module.exports = Lessons_attachments;
