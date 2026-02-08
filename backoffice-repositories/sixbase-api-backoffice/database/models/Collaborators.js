const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Collaborators extends Sequelize.Model {
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
        id_producer: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        permissions: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
      },
      {
        hooks: {
          beforeCreate: (collaborator) => {
            collaborator.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'collaborators',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      sourceKey: 'id_producer',
      foreignKey: 'id',
      as: 'producer',
    });
    this.hasOne(models.users, {
      sourceKey: 'id_user',
      foreignKey: 'id',
      as: 'collaborator',
    });
  }
}

module.exports = Collaborators;
