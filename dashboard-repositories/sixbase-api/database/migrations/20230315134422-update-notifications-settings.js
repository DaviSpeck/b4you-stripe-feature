const logger = require('../../utils/logger');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('notifications_settings', 'generated_pix', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
    try {
      const settings = await queryInterface.sequelize.query(
        'SELECT * FROM notifications_settings',
      );
      for await (const { id } of settings[0]) {
        await queryInterface.sequelize.query(
          `UPDATE notifications_settings set generated_pix = true  WHERE id = '${id}'`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('notifications_settings', 'generated_pix', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },
};
