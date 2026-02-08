module.exports = {
  up: async (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('students', 'profile_picture_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.renameColumn('students', 'profile_pic', 'profile_picture'),
    ]),

  down: async (queryInterface) => {
    await queryInterface.removeColumn('students', 'profile_picture_key');
  },
};
