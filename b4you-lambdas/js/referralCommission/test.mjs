import { handler } from './index.mjs';

process.env = {
  MYSQL_DATABASE: '',
  MYSQL_HOST: '',
  MYSQL_PASSWORD: '',
  MYSQL_PORT: 3306,
  MYSQL_USERNAME: '',
};

handler({
  Records: [
    {
      body: JSON.stringify({
        // usuário que foi indicado
        id_user: 3,
        // valor da tarifa da b4you na venda
        amount: 100,
        // status da venda
        id_status: 2,
        // id da venda
        id_sale_item: 25634,
      }),
    },
  ],
});
