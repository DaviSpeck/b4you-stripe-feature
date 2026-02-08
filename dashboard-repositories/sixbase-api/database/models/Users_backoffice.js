const Sequelize = require('sequelize');
const Encrypter = require('../../utils/helpers/encrypter');

class UsersBackoffice extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        full_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        is_admin: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        id_role: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'backoffice_roles',
            key: 'id',
          },
          onUpdate: 'RESTRICT',
          onDelete: 'SET NULL',
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: async (user) => {
            user.password = await Encrypter.hash(user.password);
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'users_backoffice',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.backoffice_roles, {
      foreignKey: 'id_role',
      as: 'role',
    });

    this.hasMany(models.withdrawal_notes, {
      foreignKey: 'id_user_backoffice',
      as: 'withdrawal_notes',
    });
  }
}

module.exports = UsersBackoffice;
