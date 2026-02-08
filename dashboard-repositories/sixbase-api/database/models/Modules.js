const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');
const Modules_Classrooms = require('./Modules_Classrooms');

class Modules extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          field: 'id',
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        title: {
          type: Sequelize.STRING,
        },
        description: {
          type: Sequelize.STRING,
        },
        order: {
          type: Sequelize.INTEGER,
        },
        active: {
          type: Sequelize.BOOLEAN,
        },
        release: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        cover: {
          type: Sequelize.STRING,
        },
        cover_key: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (module) => {
            module.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        sequelize,
        modelName: 'modules',
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.products, {
      foreignKey: 'id_product',
    });
    this.hasMany(models.lessons, {
      as: 'lesson',
      foreignKey: 'id_module',
    });
    this.belongsToMany(models.classrooms, {
      through: Modules_Classrooms,
      foreignKey: 'id_module',
      otherKey: 'id_classroom',
      as: 'classrooms',
    });
  }
}

module.exports = Modules;
