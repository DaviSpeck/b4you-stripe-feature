const logger = require('../../utils/logger');

module.exports = {
  up: async (queryInterface) => {
    try {
      const settings = await queryInterface.sequelize.query(
        'SELECT * FROM withdrawals_settings_default',
      );
      for await (const { id } of settings[0]) {
        await queryInterface.sequelize.query(
          `UPDATE withdrawals_settings_default set withheld_balance_percentage = 20  WHERE id = '${id}'`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }

    try {
      const settings = await queryInterface.sequelize.query(
        'SELECT * FROM withdrawals_settings',
      );
      for await (const { id } of settings[0]) {
        await queryInterface.sequelize.query(
          `UPDATE withdrawals_settings set withheld_balance_percentage = 20  WHERE id = '${id}'`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      const settings = await queryInterface.sequelize.query(
        'SELECT * FROM withdrawals_settings_default',
      );
      for await (const { id } of settings[0]) {
        await queryInterface.sequelize.query(
          `UPDATE withdrawals_settings_default set withheld_balance_percentage = 10  WHERE id = '${id}'`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }

    try {
      const settings = await queryInterface.sequelize.query(
        'SELECT * FROM withdrawals_settings',
      );
      for await (const { id } of settings[0]) {
        await queryInterface.sequelize.query(
          `UPDATE withdrawals_settings set withheld_balance_percentage = 10  WHERE id = '${id}'`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
};
