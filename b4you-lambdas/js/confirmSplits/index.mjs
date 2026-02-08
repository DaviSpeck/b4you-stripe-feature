import { ConfirmSplits } from './ConfirmSplits.mjs';
import { Database } from './Database.mjs';
export const handler = async (event) => {
  console.log(event);
  const database = new Database();
  await database.connect();
  try {
    const { Records } = event;
    const [message] = Records;
    const { sale_item_id, paid_at, payment_method, created_at } = JSON.parse(message.body);
    const data = await new ConfirmSplits(
      {
        paid_at,
        payment_method,
        sale_item_id,
        created_at,
      },
      database
    ).execute();
    console.log(data);
  } catch (error) {
    console.log(error);
  } finally {
    await database.closeConnection();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
