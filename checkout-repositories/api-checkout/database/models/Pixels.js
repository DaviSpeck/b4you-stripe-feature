const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Pixels extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_type: {
          type: Sequelize.BIGINT,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        id_role: {
          type: Sequelize.TINYINT,
          defaultValue: 1,
        },
        settings: {
          type: Sequelize.JSON,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      },
      {
        hooks: {
          beforeCreate: (pixel) => {
            pixel.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'pixels',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
  }
}

module.exports = Pixels;
