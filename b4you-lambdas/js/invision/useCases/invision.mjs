import { Sales } from '../database/models/Sales.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { Plugins_products } from '../database/models/Plugins_products.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { Invision } from '../services/Invision.mjs';
import { capitalizeName } from '../utils/formatters.mjs';

export class InvisionIntegration {
  #sale_id;

  constructor(sale_id) {
    this.#sale_id = sale_id;
  }

  async execute() {
    const sale = await Sales.findOne({
      where: { 'id': this.#sale_id, '$sales_items.id_status$': findSalesStatusByKey('paid').id },
      attributes: ['id_user'],
      include: [
        {
          association: 'sales_items',
          attributes: ['id_product'],
        },
        { association: 'student', attributes: ['full_name', 'email'] },
      ],
    });
    const plugin = await Plugins.findOne({
      where: {
        id_user: sale.id_user,
        id_plugin: findIntegrationTypeByKey('invision').id,
        active: true,
      },
    });
    if (!plugin) {
      console.log('Plugin not found. SALE ID: ', this.#sale_id);
      return;
    }
    if (!sale) {
      console.log('Sale not found. SALE ID: ', this.#sale_id);
      return;
    }
    const integration = new Invision(plugin.settings.api_url, plugin.settings.api_key);
    for await (const order of sale.sales_items) {
      const pluginProduct = await Plugins_products.findOne({
        where: {
          id_product: order.id_product,
          id_plugin: plugin.id,
        },
      });
      if (!pluginProduct) {
        console.log('Plugin product not found. SALE ID: ', this.#sale_id);
        return;
      }
      const {
        settings: { id_list_primary, id_list_secondary },
      } = pluginProduct;
      await integration.createMember({
        name: capitalizeName(sale.student.full_name),
        email: sale.student.email,
        primary_group_id: id_list_primary,
        secondary_group_id: id_list_secondary,
      });
    }
  }
}
