import * as Sequelize from 'sequelize';

export class PluginsLogs extends Sequelize.Model {
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
        id_plugin: {
          type: Sequelize.BIGINT,
        },
        method: {
          type: Sequelize.STRING,
        },
        url: {
          type: Sequelize.STRING,
        },
        headers: {
          type: Sequelize.JSON,
        },
        body: {
          type: Sequelize.JSON,
        },
        response: {
          type: Sequelize.JSON,
        },
        status_code: {
          type: Sequelize.INTEGER,
        },
        is_manual_resend: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        resent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: false, 
        sequelize,
        modelName: 'plugins_logs',
        indexes: [
          {
            fields: ['id_plugin'],
          },
          {
            fields: ['id_user'],
          },
          {
            fields: ['created_at'],
          },
        ],
      },
    );

    return PluginsLogs;
  }

  static associate(models) {
    PluginsLogs.belongsTo(models.plugins, {
      foreignKey: 'id_plugin',
      as: 'plugin',
    });
  }
}
