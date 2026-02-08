import { HttpClient } from './HTTPClient.mjs';

export class WoocommerceService {
    #service;
    #consumer_key;
    #consumer_secret;
    constructor({ consumer_key, consumer_secret, url }) {
        this.#consumer_key = consumer_key;
        this.#consumer_secret = consumer_secret;
        this.headers = {
            'Content-Type': 'application/json',
        };
        const cleanUrl = url.replace(/\/$/, '');
        this.#service = new HttpClient({ baseURL: cleanUrl });
    }

    async sendOrder(order) {
        try {
            const response = await this.#service.post('/wp-json/wc/v3/orders', order, {
                auth: {
                    username: this.#consumer_key,
                    password: this.#consumer_secret,
                },
                headers: this.headers,
            });
            return response.data;
        } catch (err) {
            console.error(
                'Erro ao enviar pedido para WooCommerce:',
                err.response?.data || err.message
            );
            throw err;
        }
    }
}