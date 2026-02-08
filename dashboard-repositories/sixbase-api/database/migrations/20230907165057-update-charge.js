module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("charges", "last_notification", {
        type: Sequelize.DATE,
      }),
      queryInterface.addColumn("charges", "count_notification", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn("charges", "qrcode_url", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn("charges", "last_notification"),
      queryInterface.removeColumn("charges", "count_notification"),
      queryInterface.removeColumn("charges", "qrcode_url"),
    ]);
  },
};
