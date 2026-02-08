const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Invites extends Sequelize.Model {
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
          defaultValue: Sequelize.UUIDV4,
          unique: true,
        },
        already_used: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
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
          beforeCreate: (invite) => {
            invite.uuid = uuid.nanoid();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'invites',
        underscored: true,
      },
    );

    return this;
  }
}

module.exports = Invites;
