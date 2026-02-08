'use strict';

const TABLE = 'backoffice_notes';
const ADMINISTRATIVE_TYPE_ID = 1;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      await queryInterface.addColumn(
        TABLE,
        'uuid',
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        TABLE,
        'version',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        { transaction },
      );

      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET uuid = UUID() WHERE uuid IS NULL`,
        { transaction },
      );

      await queryInterface.changeColumn(
        TABLE,
        'uuid',
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        TABLE,
        'version',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        { transaction },
      );

      await queryInterface.changeColumn(
        TABLE,
        'type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: ADMINISTRATIVE_TYPE_ID,
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(TABLE, 'uuid', { transaction });
      await queryInterface.removeColumn(TABLE, 'version', { transaction });
      await queryInterface.changeColumn(
        TABLE,
        'type',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );
    });
  },
};
