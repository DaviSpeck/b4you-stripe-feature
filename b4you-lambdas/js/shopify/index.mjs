import { Database } from './database/sequelize.mjs';
import { ShopifyUseCase } from './useCases/shopify.mjs'

export const handler = async (event) => {
    console.log('Shopify ->', event);

    const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

    const database = await new Database({
        database: MYSQL_DATABASE,
        host: MYSQL_HOST,
        password: MYSQL_PASSWORD,
        username: MYSQL_USERNAME,
        port: MYSQL_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions: { decimalNumbers: true },
    }).connect();

    let hasError = false;
    let messageId = null;

    try {
        const { Records } = event;
        const [message] = Records || [];
        if (!message?.body) {
            console.log('Mensagem inválida ou vazia');
            return;
        }
        messageId = message.messageId;
        const { sale_id = null, status = 'paid', id_sale_item = null } = JSON.parse(message.body);
        // paid, pending, refunded
        await new ShopifyUseCase({ sale_id, id_sale_item, status }).execute()

    } catch (error) {
        console.error('Erro no processamento:', error);
        hasError = true;
    } finally {
        await database.closeConnection();
        if (hasError && messageId) {
            const batchItemFailures = [
                {
                    itemIdentifier: messageId,
                },
            ];
            console.log('batchItemFailure', batchItemFailures);
            return {
                batchItemFailures,
            };
        }
    }
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
