import { ApprovedPaymentNotifications } from './ApprovedPaymentNotifications.mjs';
import { Database } from './Database.mjs';

export const handler = async (event) => {
  console.log(event);
  const database = new Database();
  await database.connect();
  try {
    const { Records } = event;
    const [message] = Records;
    const { saleItemUuid } = JSON.parse(message.body);
    const data = await new ApprovedPaymentNotifications(
      {
        sale_uuid: saleItemUuid,
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
