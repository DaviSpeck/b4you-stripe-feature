module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'instagram', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('users', 'instagram')]);
  },
};
