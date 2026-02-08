const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');
const Modules_Classrooms = require('./Modules_Classrooms');

class Classrooms extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          field: 'id',
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        label: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
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
          beforeCreate: (classroom) => {
            classroom.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        sequelize,
        paranoid: true,
        modelName: 'classrooms',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.modules, {
      through: Modules_Classrooms,
      foreignKey: 'id_classroom',
      otherKey: 'id_module',
      as: 'modules',
    });
    this.hasMany(models.student_products, {
      foreignKey: 'id_classroom',
      as: 'student_products',
    });
    this.hasMany(models.product_offer, {
      foreignKey: 'id_classroom',
      as: 'offers',
    });
  }
}

module.exports = Classrooms;
