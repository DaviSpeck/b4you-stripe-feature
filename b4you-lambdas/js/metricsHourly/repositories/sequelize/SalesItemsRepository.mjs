import { Sales_items } from "../../database/models/Sales_items.mjs";

export class SalesItemsRepository {
    static async findAll(options = {}) {
        try {
            const salesItems = await Sales_items.findAll(options);
            return salesItems;
        } catch (error) {
            console.error('Erro ao buscar sales items:', error);
            throw error;
        }
    }
};