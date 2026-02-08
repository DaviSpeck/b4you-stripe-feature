const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Anchors extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        label: {
          type: Sequelize.STRING,
        },
        order: {
          type: Sequelize.INTEGER,
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
          beforeCreate: (anchor) => {
            anchor.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'anchors',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.modules, {
      through: models.modules_anchors,
      foreignKey: 'id_anchor',
      otherKey: 'id_module',
      as: 'modules',
    });
  }
}

module.exports = Anchors;
