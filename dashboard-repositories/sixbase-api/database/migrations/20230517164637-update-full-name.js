module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'full_name', {
      type: Sequelize.STRING,
    });

    const [users] = await queryInterface.sequelize.query('SELECT * FROM users');
    for await (const { first_name, last_name, id } of users) {
      const full_name = `${first_name} ${last_name}`;
      await queryInterface.sequelize.query(
        `UPDATE users set full_name = '${full_name}' WHERE id = '${id}'`,
      );
    }
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('users', 'full_name')]);
  },
};
