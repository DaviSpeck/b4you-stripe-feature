module.exports = {
  up: async (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('users', 'biography', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.addColumn('users', 'occupation', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('users', 'profile_picture_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]),

  down: async (queryInterface) => {
    Promise.all([
      queryInterface.removeColumn('users', 'biography'),
      queryInterface.removeColumn('users', 'occupation'),
      queryInterface.removeColumn('users', 'profile_picture_key'),
    ]);
  },
};
