/** @type {import('sequelize-cli').Migration} */
const date = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'DROP PROCEDURE IF EXISTS procedure_update_users_revenue',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS insert_users_revenue',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS update_users_revenue',
    );
    await queryInterface.dropTable('users_revenue');

    await queryInterface.createTable('users_revenue', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      paid_at: {
        type: Sequelize.DATEONLY,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      total: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
      },
    });

    await queryInterface.sequelize.query(
      'ALTER TABLE `users_revenue` ADD UNIQUE `unique_index`(`paid_at`, `id_user`);',
    );

    await queryInterface.sequelize.query(
      'CREATE PROCEDURE procedure_update_users_revenue(IN id_user BIGINT, IN id_status INTEGER, IN release_date DATE, IN user_net_amount DECIMAL(10, 2), IN paid_at DATE)' +
        ' READS SQL DATA \n' +
        ' BEGIN \n' +
        '   IF id_status = 1 AND release_date is not NULL THEN\n' +
        '     INSERT INTO users_revenue (paid_at, id_user, total) VALUES(paid_at, id_user, user_net_amount)\n' +
        '     ON DUPLICATE KEY\n' +
        '     UPDATE total = total + user_net_amount;\n' +
        '   ELSEIF id_status = 8 OR id_status = 9 THEN\n' +
        '     UPDATE users_revenue as a set a.total = a.total - user_net_amount where a.id_user = id_user and a.paid_at = paid_at; \n' +
        '   END IF;\n' +
        'END ',
    );

    await queryInterface.sequelize.query(
      'CREATE TRIGGER update_users_revenue ' +
        'AFTER UPDATE ON transactions ' +
        'FOR EACH ROW ' +
        'BEGIN ' +
        'DECLARE paid_at DATE; ' +
        'IF new.id_type = 3 and new.id_status != 2 THEN\n' +
        "IF new.method = 'card' THEN\n" +
        'SET paid_at = new.created_at;\n' +
        "ELSEIF new.method = 'pix' THEN\n" +
        'SET paid_at = new.release_date; ELSE\n' +
        'SET paid_at = DATE(new.release_date - INTERVAL 1 DAY); END IF;\n' +
        `CALL procedure_update_users_revenue(NEW.id_user, new.id_status, new.release_date, new.user_net_amount, paid_at); ` +
        'END IF;\n' +
        'END\n',
    );

    await queryInterface.sequelize.query(
      'CREATE TRIGGER insert_users_revenue ' +
        'AFTER INSERT ON transactions ' +
        'FOR EACH ROW ' +
        'BEGIN ' +
        'DECLARE paid_at DATE; ' +
        'IF new.id_type = 3 and new.id_status != 2 THEN\n' +
        "IF new.method = 'card' THEN\n" +
        'SET paid_at = new.created_at;\n' +
        "ELSEIF new.method = 'pix' THEN\n" +
        'SET paid_at = new.release_date; ELSE\n' +
        'SET paid_at = DATE_ADD(new.release_date, INTERVAL 1 DAY); END IF;\n' +
        `CALL procedure_update_users_revenue(NEW.id_user, new.id_status, new.release_date, new.user_net_amount, paid_at); ` +
        'END IF;\n' +
        'END\n',
    );

    let total = 100;
    let offset = 0;
    while (total !== 0) {
      // eslint-disable-next-line no-await-in-loop
      const [transactions] = await queryInterface.sequelize.query(`select
        t.id_user,
        t.id,
        t.user_net_amount,
        t.id_status,
        t.release_date,
        t.created_at,
        t.method
      from
        transactions t
      where
        t.id_type = 3
        and (t.id_status = 2
          OR (t.id_status = 1
            and t.release_date is not NULL))
       LIMIT 100 OFFSET ${offset}`);

      total = transactions.length;
      offset += 100;

      // eslint-disable-next-line no-await-in-loop
      for await (const transaction of transactions) {
        console.log(transaction);
        await queryInterface.sequelize.query(`
CALL procedure_update_users_revenue(${transaction.id_user}, ${
          transaction.id_status === 2 ? 1 : transaction.id_status
        }, '${
          transaction.release_date
            ? transaction.release_date
            : date(transaction.created_at).format(DATABASE_DATE)
        }',
${transaction.user_net_amount}, '${
          transaction.method === 'card'
            ? date(transaction.created_at).format('yyyy-MM-DD')
            : transaction.method === 'billet'
            ? date(
                transaction.release_date
                  ? transaction.release_date
                  : transaction.created_at,
              ).subtract(1, 'day')
            : transaction.release_date
        }'); `);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP PROCEDURE IF EXISTS procedure_update_users_revenue',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS insert_users_revenue',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS update_users_revenue',
    );
    await queryInterface.dropTable('users_revenue');
  },
};
