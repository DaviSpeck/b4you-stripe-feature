import * as Sequelize from 'sequelize';
import { v4 } from 'uuid';

export class CollaboratorsActivity extends Sequelize.Model {
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
        id_user_request: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_collaborator: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        route: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        params: {
          type: Sequelize.JSON,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (collaborator) => {
            collaborator.uuid = v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'collaborators_activity',
      }
    );

    return this;
  }
}
