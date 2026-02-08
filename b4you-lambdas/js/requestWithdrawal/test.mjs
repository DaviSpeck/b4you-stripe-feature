import { handler } from './index.mjs';

handler({
  Records: [
    {
      body: JSON.stringify({
        id_user: 29866,
        amount: 100000,
      }),
    },
  ],
});
