const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Market_images extends Sequelize.Model {
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
          references: {
            model: 'users_backoffice',
            key: 'id',
          },
        },
        url: {
          type: Sequelize.STRING,
        },
        file: {
          type: Sequelize.TEXT,
        },
        key: {
          type: Sequelize.STRING,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
        },
        id_type: {
          type: Sequelize.INTEGER,
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        hooks: {
          beforeCreate: (markt_images) => {
            markt_images.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'market_images',
      },
    );

    return this;
  }
}

module.exports = Market_images;
