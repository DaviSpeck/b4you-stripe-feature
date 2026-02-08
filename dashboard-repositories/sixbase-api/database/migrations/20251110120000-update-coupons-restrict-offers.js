

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('coupons_product_offers', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_coupon: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'coupons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_offer: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'product_offer',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint('coupons_product_offers', {
      fields: ['id_coupon', 'id_offer'],
      type: 'unique',
      name: 'coupons_product_offers_unique_coupon_offer',
    });

    await queryInterface.addColumn('coupons', 'restrict_offers', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.removeColumn('coupons', 'id_offer');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('coupons', 'id_offer', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'product_offer',
        key: 'id',
      },
    });

    await queryInterface.removeColumn('coupons', 'restrict_offers');
    await queryInterface.dropTable('coupons_product_offers');
  },
};

