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
        id_product: 949,
        id_user: 47,
        id_sale_item: 1491416,
        id_event: 12,
        id_affiliate: 1,
      }),
    },
  ],
});
