const Sequelize = require('sequelize');

module.exports = class Backoffice_notes extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },

        id_user_backoffice: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },

        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },

        uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
        },

        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        type: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },

        summary: {
          type: Sequelize.STRING(800),
          allowNull: true,
        },

        next_action: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },

        pending_points: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },

        additional_notes: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },

        followup_status: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },

        next_contact_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },

        note: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },

        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        sequelize,
        modelName: 'backoffice_notes',
        freezeTableName: true,
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: 'deleted_at',
        paranoid: true,

        indexes: [
          {
            unique: true,
            fields: ['uuid', 'version'],
          },
          {
            fields: ['uuid'],
          },
          {
            fields: ['id_user'],
          },
        ],
      },
    );

    this.addHook('beforeCreate', async (instance, options) => {
      if (instance.version) return;

      const last = await this.findOne({
        where: {
          uuid: instance.uuid,
          id_user: instance.id_user,
        },
        order: [['version', 'DESC']],
        transaction: options.transaction,
        lock: options.transaction?.LOCK?.UPDATE,
      });

      instance.version = last ? last.version + 1 : 1;
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.users_backoffice, {
      foreignKey: 'id_user_backoffice',
      targetKey: 'id',
      as: 'user_backoffice',
    });

    this.belongsTo(models.users, {
      foreignKey: 'id_user',
      targetKey: 'id',
      as: 'user',
    });
  }
};