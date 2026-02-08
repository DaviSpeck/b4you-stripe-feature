/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users_total_commission', {
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
        unique: true,
      },
      total: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
      },
    });

    await queryInterface.sequelize.query(
      'CREATE PROCEDURE procedure_update_total_commission(IN id_user BIGINT, IN id_status INTEGER, IN release_date DATE, IN user_net_amount DECIMAL(10, 2))' +
      ' READS SQL DATA \n' +
      ' BEGIN \n' +
      "   IF id_status = 2 OR id_status = 1 AND release_date is not NULL THEN\n" +
      '     INSERT INTO users_total_commission (id_user, total) VALUES(id_user, user_net_amount)\n' +
      '     ON DUPLICATE KEY\n' +
      '     UPDATE total = total + user_net_amount;\n' +
      '   ELSEIF id_status = 8 OR id_status = 9 THEN\n' +
      '     UPDATE users_total_commission as a set a.total = a.total - user_net_amount where a.id_user = id_user; \n' +
      '   END IF;\n' +
      'END ',
    );

    await queryInterface.sequelize.query(
      'CREATE TRIGGER update_transactions ' +
      'AFTER UPDATE ON transactions ' +
      'FOR EACH ROW ' +
      'BEGIN ' +
      "IF new.id_type = 3 AND (new.id_status != 2 or new.method = 'pix') THEN " +
      'CALL procedure_update_total_commission(NEW.id_user, new.id_status, new.release_date, new.user_net_amount); ' +
      'END IF;\n' +
      'END\n',
    );

    await queryInterface.sequelize.query(
      'CREATE TRIGGER INSERT_transactions ' +
      'AFTER INSERT ON transactions ' +
      'FOR EACH ROW ' +
      'BEGIN ' +
      "IF new.id_type = 3 AND (new.id_status != 2 or new.method = 'pix') THEN " +
      'CALL procedure_update_total_commission(NEW.id_user, new.id_status, new.release_date, new.user_net_amount); ' +
      'END IF;\n' +
      'END\n',
    );

    let total = 100;
    let offset = 0;
    while (total !== 0) {
      // eslint-disable-next-line no-await-in-loop
      const [transactions] = await queryInterface.sequelize.query(`select
        t.id_user,
        sum(t.user_net_amount) as total
      from
        transactions t
      where
        t.id_type = 3
        and (t.id_status = 2
          OR (t.id_status = 1
            and t.release_date is not NULL))
        GROUP by
          t.id_user LIMIT 100 OFFSET ${offset}`);

      total = transactions.length;
      offset += 100;

      // eslint-disable-next-line no-await-in-loop
      for await (const transaction of transactions) {
        await queryInterface.sequelize.query(
          `INSERT INTO users_total_commission (id_user, total) VALUES(${transaction.id_user}, ${transaction.total})`,
        );
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP PROCEDURE IF EXISTS procedure_update_total_commission',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS insert_transactions',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS update_transactions',
    );
    await queryInterface.dropTable('users_total_commission');
  },
};
