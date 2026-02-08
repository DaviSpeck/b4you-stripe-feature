const uuid = require('../../utils/helpers/uuid');
const date = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_pages', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      uuid: {
        type: Sequelize.UUID,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_type: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });

    const [offers] = await queryInterface.sequelize.query(
      `SELECT id_product, sales_page_url FROM product_offer where sales_page_url is not null and deleted_at is null`,
    );

    for await (const offer of offers) {
      await queryInterface.sequelize.query(
        `INSERT INTO product_pages (id_product, uuid, label, url, created_at, id_type) VALUES (${
          offer.id_product
        }, '${uuid.nanoid()}', 'Página de Vendas', '${
          offer.sales_page_url
        }', '${date().format(DATABASE_DATE)}', 2)`,
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_pages');
  },
};
