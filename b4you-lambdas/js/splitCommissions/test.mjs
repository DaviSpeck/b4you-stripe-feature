import { handler } from './index.mjs';

handler({
  Records: [{ body: JSON.stringify({ sale_item_id: 24517 }) }],
});
