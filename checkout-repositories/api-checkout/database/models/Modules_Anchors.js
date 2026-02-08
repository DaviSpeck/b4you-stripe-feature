const Sequelize = require('sequelize');

module.exports = class Modules_Anchors extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_module: {
          type: Sequelize.BIGINT,
        },
        id_anchor: {
          type: Sequelize.BIGINT,
        },
        order: {
          type: Sequelize.INTEGER,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'modules_anchors',
      },
    );

    return this;
  }
};
