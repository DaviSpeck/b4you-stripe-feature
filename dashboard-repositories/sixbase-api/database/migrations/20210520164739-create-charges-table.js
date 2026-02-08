module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('charges', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDv4,
        unique: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_sale: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_nfse: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      psp_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      price: {
        type: Sequelize.FLOAT(20, 2),
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      installments: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      billet_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('charges');
  },
};
