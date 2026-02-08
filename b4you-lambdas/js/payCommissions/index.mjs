import mysql from 'mysql2/promise';
import moment from 'moment';

export const handler = async () => {
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

  let database;

  try {
    database = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USERNAME,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      port: MYSQL_PORT,
    });

    let total = 100;
    const id_status = 2;
    const date = moment().format('YYYY-MM-DD');
    while (total !== 0) {
      const sql = database.format(
        'select id, id_user, amount from commissions where id_status = ? and release_date <= ? limit 100',
        [id_status, date]
      );
      const [commissions] = await database.execute(sql);
      total = commissions.length;
      if (total < 100) {
        total = 0;
      }
      for await (const { id, id_user, amount } of commissions) {
        console.log(id, id_user, amount);
        await database.execute('update balances set amount = amount + ? where id_user = ?', [
          amount,
          id_user,
        ]);
        await database.execute('update commissions set id_status = ? where id = ?', [3, id]);
      }
    }
  } catch (error) {
    console.log(error);
    await database.end();
    throw error;
  } finally {
    await database.end();
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
