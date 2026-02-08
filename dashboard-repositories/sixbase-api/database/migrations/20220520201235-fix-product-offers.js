const logger = require('../../utils/logger');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'installments', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'payment_methods', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('product_offer', 'student_pays_interest', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
    ]);
    try {
      const products = await queryInterface.sequelize.query(
        'SELECT * FROM products',
      );
      for await (const {
        installments,
        payment_methods,
        student_pays_interest,
        id,
      } of products[0]) {
        await queryInterface.sequelize.query(
          `UPDATE product_offer set installments = '${installments}', payment_methods = '${payment_methods}', student_pays_interest = '${student_pays_interest}' WHERE id_product = '${id}'`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
    await Promise.all([
      queryInterface.removeColumn('products', 'installments'),
      queryInterface.removeColumn('products', 'payment_methods'),
      queryInterface.removeColumn('products', 'student_pays_interest'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'installments', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'payment_methods', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'student_pays_interest', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
    ]);
    try {
      const products = await queryInterface.sequelize.query(
        'SELECT * FROM products',
      );
      for await (const { id } of products[0]) {
        const [offer] = await queryInterface.sequelize.query(
          `SELECT * FROM product_offer WHERE id_product = '${id}' limit 1`,
        );

        let installments = 1;
        let student_pays_interest = true;
        let payment_methods = 'credit_card';
        if (offer[0]) {
          installments = offer[0].installments;
          student_pays_interest = offer[0].student_pays_interest;
          payment_methods = offer[0].payment_methods;
        }
        await queryInterface.sequelize.query(
          `UPDATE products set installments = "${installments}", student_pays_interest = ${student_pays_interest}, payment_methods = "${payment_methods}" WHERE id="${id}"`,
        );
      }
    } catch (error) {
      logger.error(error);
    }
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'installments'),
      queryInterface.removeColumn('product_offer', 'payment_methods'),
      queryInterface.removeColumn('product_offer', 'student_pays_interest'),
    ]);
  },
};
