import { handler } from "./index.mjs";

handler({
  Records: [
    {
      body: JSON.stringify({
        input: null,
        product_uuid: null,
        first_name: "João",
        email: "leonardo.neves@codgital.com",
        id_user: 1376,
      }),
    },
  ],
});
