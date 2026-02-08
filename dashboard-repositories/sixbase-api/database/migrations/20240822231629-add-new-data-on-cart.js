module.exports = {
    up: async (queryInterface, Sequelize) => {
      await Promise.all([
        queryInterface.addColumn('cart', 'id_affiliate', {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: null,
        }),
        queryInterface.addColumn('cart', 'address', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        }),
        queryInterface.addColumn('cart', 'coupon', {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        }),
      ]);
    },
  
    down: async (queryInterface) => {
      await Promise.all([
        queryInterface.removeColumn('cart', 'id_affiliate'),
        queryInterface.removeColumn('cart', 'address'),
        queryInterface.removeColumn('cart', 'coupon'),
      ]);
    },
  };
  