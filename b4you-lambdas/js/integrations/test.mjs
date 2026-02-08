import { handler } from './index.mjs';

process.env = {
  MYSQL_DATABASE: 'test_db',
  MYSQL_HOST: 'localhost',
  MYSQL_PASSWORD: 'test_password',
  MYSQL_USERNAME: 'test_user',
  MYSQL_PORT: '3306',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'test-access-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret-key',
  NODE_ENV: 'development',
  STAGE: 'dev',
};

const event = {
  Records: [
    {
      body: JSON.stringify({
        id_product: 1,
        eventName: 'createOmieCustomer',
        data: {
          full_name: 'João Silva',
          email: 'joao.silva@example.com',
          phone: '(11) 99999-9999',
          cpf_cnpj: '123.456.789-00',
          address: {
            street: 'Rua das Flores, 123',
            city: 'São Paulo',
            state: 'SP',
            zipcode: '01234-567',
          },
        },
      }),
    },
  ],
};

handler(event);
