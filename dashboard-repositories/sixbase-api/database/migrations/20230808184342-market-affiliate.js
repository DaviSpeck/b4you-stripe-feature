/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'verify_market',
        {
          id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
          },
          id_user: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          },
          id_product: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
              model: 'products',
              key: 'id',
            },
          },
          id_status: {
            type: Sequelize.BIGINT,
          },
          reason: {
            type: Sequelize.TEXT,
          },
          internal_descriptions: {
            type: Sequelize.TEXT,
          },
          requested_at: Sequelize.DATE,
          accepted_at: Sequelize.DATE,
          rejected_at: Sequelize.DATE,
          created_at: Sequelize.DATE,
          updated_at: Sequelize.DATE,
        },
        { transaction: t },
      );

      const [products] = await queryInterface.sequelize.query(
        'SELECT * FROM products',
        { transaction: t },
      );
      for await (const { id } of products) {
        await queryInterface.sequelize.query(
          `UPDATE products set id_status_market = '1' WHERE id = '${id}'`,
          { transaction: t },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('verify_market');
  },
};
