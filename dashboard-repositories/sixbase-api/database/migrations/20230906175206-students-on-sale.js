module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn("sales", "full_name", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("sales", "document_number", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("sales", "whatsapp", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("sales", "email", {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn("sales", "full_name"),
      queryInterface.removeColumn("sales", "whatsapp"),
      queryInterface.removeColumn("sales", "document_number"),
      queryInterface.removeColumn("sales", "whatsapp"),
    ]);
  },
};
