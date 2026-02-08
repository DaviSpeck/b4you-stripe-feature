import { Plugins } from '../database/models/Plugins.mjs';
import { Sales } from '../database/models/Sales.mjs';
import { Zoppy } from '../services/ZoppyShipping.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { ZoppyAbandonedCart } from './ZoppyAbandonedCart.mjs';
import { ZoppyInsertSale } from './ZoppyInsertSale.mjs';
import { ZoppyUpdateSale } from './ZoppyUpdateSale.mjs';

export class ZoppyShipping {
  #sale_id;
  #event_name;
  #cart;
  #id_user;

  constructor(sale_id, event_name, cart, id_user) {
    this.#sale_id = sale_id;
    this.#event_name = event_name;
    this.#cart = cart;
    this.#id_user = id_user;
  }

  async execute() {
    try {
        let sale = null;

        if(!this.#cart) {
            const saleExists = await Sales.findOne({
                where: { 'id': this.#sale_id,},
                include: [
                {
                  association: 'sales_items',
                  attributes: [
                    'id',
                    'price_product',
                    'shipping_price',
                    'quantity',
                    'discount_amount',
                    'discount_percentage',
                    'payment_method',
                    'id_product',
                    'id_product_tiny',
                    'id_status',
                    'paid_at',
                    'price_total',
                    'updated_at',
                  ], 
                  include: [
                    {
                      association: 'offer',
                      attributes: ['uuid', 'id', 'name', 'metadata'],
                    },
                    {
                      association: 'product',
                      attributes: ['id', 'name']
                    },
                    
                  ],
                },
                {
                  association:'student',
                  attributes: ['full_name', 'document_number', 'email', 'whatsapp', 'address', 'document_type'],
                },
                {
                  association: 'user',
                  attributes: ['id', 'full_name', 'email', 'whatsapp'],
                }
              ],
            });
      
            if (!saleExists) {
              console.log('Sale with missing parameters. SALE ID->: ', this.#sale_id);
              return;
            } else {
              sale = saleExists;
            }

            if (!sale) {
              console.log('Sale not found. SALE ID: ', this.#sale_id);
              return;
            }
        }
       
        const plugin = await Plugins.findOne({
          where: {
            id_user: this.#id_user,
            id_plugin: findIntegrationTypeByKey('zoppy').id,
          },
        });

        if (!plugin) {
          console.log('Plugin not found. SALE ID: ', this.#sale_id);
          return;
        }

        const zoppy = new Zoppy(plugin.settings.apiKey, this.#id_user);

        if(this.#event_name === 'insertSale') {
          const zoppyApprovedSale = new ZoppyInsertSale(sale, zoppy)
          await zoppyApprovedSale.execute();
        }

        if(this.#event_name === 'updateSale') {
          const zoppyUpdateSale = new ZoppyUpdateSale(sale, zoppy)
          await zoppyUpdateSale.execute();
        }

        if(this.#event_name === 'abandonedCart') {
          const zoppyAbandonedCart = new ZoppyAbandonedCart(this.#cart, zoppy)
          await zoppyAbandonedCart.execute();
        }
    } catch (error) {
      return error;
    }
  }
}
