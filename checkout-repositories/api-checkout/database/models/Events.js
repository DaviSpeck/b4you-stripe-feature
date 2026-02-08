const Sequelize = require('sequelize')

class Events extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
        event_type: { type: Sequelize.STRING, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        id_offer: { type: Sequelize.BIGINT, allowNull: false },
        sale_item_id: { type: Sequelize.STRING, allowNull: true },
        url: { type: Sequelize.STRING, allowNull: true },
        session_id: { type: Sequelize.STRING, allowNull: false },
        created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        user_agent: { type: Sequelize.STRING, allowNull: true },
        ip: { type: Sequelize.STRING, allowNull: false },
      },
      {
        timestamps: false,
        paranoid: true,
        createdAt: 'created_at',
        sequelize,
        modelName: 'events',
      },
    );
    return this;
  }
}
module.exports = Events;
