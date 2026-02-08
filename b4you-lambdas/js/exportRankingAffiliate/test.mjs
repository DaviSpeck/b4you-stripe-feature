import { handler } from "./index.mjs";

handler({
  Records: [
    {
      body: JSON.stringify({
        start: "2024-07-26",
        end: "2025-08-08",
        products: null,
        first_name: "João",
        email: "leonardo.neves@codgital.com",
        id_user: 1321,
      }),
    },
  ],
});
