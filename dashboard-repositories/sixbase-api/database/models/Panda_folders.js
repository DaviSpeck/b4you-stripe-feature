const Sequelize = require('sequelize');

class Panda_folders extends Sequelize.Model {
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
          allowNull: false,
        },
        external_uuid: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: false,
        sequelize,
        modelName: 'panda_folders',
      },
    );

    return this;
  }
}

module.exports = Panda_folders;
