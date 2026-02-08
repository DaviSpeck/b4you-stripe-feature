import { Sales } from '../database/models/Sales.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { BlingV3 } from '../services/BlingShippingV3.mjs';
import { Op } from 'sequelize';

export class BlingShippingV3 {
  #saleId;

  constructor(saleId) {
    this.#saleId = saleId;
  }
  async execute() {
    const sale = await Sales.findOne({
      where: {
        id: this.#saleId,
        id_order_bling: {
          [Op.ne]: null,
        },
      },
    });

    if (!sale) {
      console.log('Sale with missing parameters. SALE ID->: ', this.#saleId);
      return;
    }

    console.log('SALE COMPLETA', JSON.stringify(sale));

    const plugin = await Plugins.findOne({
      where: {
        id_user: sale.id_user,
        id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
        active: true,
      },
    });

    const blingV3 = new BlingV3(
      plugin.settings.refresh_token,
      plugin.settings.access_token
    );

    try {
      if (!(await blingV3.verifyCredentials())) {
        const { refresh_token, access_token } = await blingV3.refreshToken();

        await Plugins.update(
          {
            settings: {
              ...plugin.settings,
              refresh_token,
              access_token,
            },
          },
          {
            where: {
              id: plugin.id,
            },
          }
        );
        await blingV3.cancelOrder({
          id_bling: sale.id_order_bling,
        });
      }
    } catch (error) {
      console.log('error ->', error);
    }
  }
}
