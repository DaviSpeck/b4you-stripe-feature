import { findIntegrationType, findIntegrationTypeByKey } from '../types/integrationsTypes.mjs';
import { findRulesTypesByKey } from '../types/integrationRulesTypes.mjs';
import { splitFullName, capitalizeName } from '../utils/formatters.mjs';
import { ActiveCampaign } from '../services/ActiveCampaign.mjs';
import { Cademi } from '../services/Cademi.mjs';
import { Astronmember } from '../services/Astronmember.mjs';
import { HotzApp } from '../services/HotzApp.mjs';
import { Leadlovers } from '../services/Leadlovers.mjs';
import { MailChimp } from '../services/MailChimp.mjs';
import { Sellflux } from '../services/Sellflux.mjs';
import { Voxuy } from '../services/Voxuy.mjs';
import { Omie } from '../services/Omie.mjs';
import { Products } from '../database/models/Products.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { Plugins_products } from '../database/models/Plugins_products.mjs';
import { Subscriptions } from '../database/models/Subscriptions.mjs';
import { Memberkit } from '../services/Memberkit.mjs';
import { Utmify } from '../services/Utmify.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Op } from 'sequelize';
import { Sales } from '../database/models/Sales.mjs';

const findSingleProductWithProducer = async where => {
  const product = await Products.findOne({
    where,
    include: [
      {
        association: 'producer',
      },
    ],
  });

  return product;
};

const findAllPlugins = async where => {
  const plugins = await Plugins.findAll({
    where,
    raw: true,
  });
  return plugins;
};

const findPluginsProducts = async where => {
  const plugin = await Plugins_products.findAll({
    raw: true,
    nest: true,
    where,
    include: [
      {
        association: 'product',
      },
      {
        association: 'plugin',
      },
    ],
  });
  return plugin;
};

const findPluginsProductsEvents = async ({ id_plugin, id_product, id_rule }) => {
  const plugins = await Plugins_products.findAll({
    nest: true,
    where: { id_product, id_rule },
    include: [
      {
        association: 'product',
      },
      {
        association: 'plugin',
        where: {
          id_plugin,
        },
      },
    ],
  });

  return plugins.map(p => p.toJSON());
};

const insertOnList = async (
  { filteredActiveCampaign, filteredLeadlovers, filteredMailchimp },
  { full_name, email, phone }
) => {
  const { firstName, lastName } = splitFullName(full_name);

  for await (const activeCampaign of filteredActiveCampaign) {
    try {
      const integration = new ActiveCampaign(
        activeCampaign.plugin.settings.apiUrl,
        activeCampaign.plugin.settings.apiKey
      );
      await integration.verifyCredentials();
      if (activeCampaign.insert_list) {
        const {
          contact: { id },
        } = await integration.createOrUpdateContact({
          email,
          firstName,
          lastName,
          phone,
        });
        await integration.insertContactOnList({
          idList: activeCampaign.settings.id_list,
          idContact: id,
        });
        if (activeCampaign.settings.ids_tags.length > 0) {
          for await (const d of activeCampaign.settings.ids_tags) {
            console.log('disparando tag active campaign', id, d);
            try {
              await integration.updateTagToContact({
                idTag: d,
                idContact: id,
              });
            } catch (error) {
              console.log('error on tag active contact', error);
            }
          }
        }
      } else {
        await integration.removeContactOnList(email, activeCampaign.settings.id_list);
      }
    } catch (error) {
      console.log('ERRO: INTEGRAÇÃO ACTIVE CAMPAIGN');
      console.log(JSON.stringify(activeCampaign));
      console.log(JSON.stringify(error));
    }
  }
  for await (const leadLovers of filteredLeadlovers) {
    try {
      const integration = new Leadlovers(leadLovers.plugin.settings.token);
      await integration.verifyCredentials();
      if (leadLovers.insert_list) {
        await integration.insertContactOnLead({
          email,
          MachineCode: leadLovers.settings.machineCode,
          EmailSequenceCode: leadLovers.settings.sequenceCode,
          SequenceLevelCode: leadLovers.settings.level,
          fullName: capitalizeName(full_name),
          phone,
        });
      } else {
        await integration.removeContactOnLead(email, leadLovers.settings.machineCode);
      }
    } catch (error) {
      console.log('ERRO: INTEGRAÇÃO LEADLOVERS');
      console.log(JSON.stringify(leadLovers));
      console.log(JSON.stringify(error));
    }
  }

  for await (const mailChimp of filteredMailchimp) {
    try {
      const integration = new MailChimp(
        mailChimp.plugin.settings.apiKey,
        mailChimp.plugin.settings.subdomain
      );
      await integration.verifyCredentials();
      if (mailChimp.insert_list) {
        await integration.insertContactOnList(
          mailChimp.settings.id_list,
          email,
          firstName,
          lastName,
          phone
        );
      } else {
        await integration.removeContactOnList(mailChimp.settings.id_list, email);
      }
    } catch (error) {
      console.log('ERRO: INTEGRAÇÃO MAILCHIMP');
      console.log(JSON.stringify(mailChimp));
      console.log(JSON.stringify(error));
    }
  }
};

export class EventService {
  constructor({ id_product }) {
    this.id_product = id_product;
  }

  async getHotzappIntegration(sale_uuid = null) {
    let id_affiliate = 0;
    if (sale_uuid) {
      const saleItem = await Sales_items.findOne({
        nest: true,
        where: { uuid: sale_uuid },
        attributes: ['id_affiliate'],
        include: [{ association: 'affiliate', attributes: ['id_user', 'id_product'] }],
      });
      if (saleItem && saleItem.affiliate) {
        id_affiliate = saleItem.affiliate.id_user;
      }
    }
    let plugins = null;
    const product = await findSingleProductWithProducer({
      id: this.id_product,
    });
    if (product) {
      const where = {
        id_plugin: findIntegrationType('HotzApp').id,
        [Op.or]: [{ id_user: product.id_user }, { id_user: id_affiliate }],
      };
      plugins = await findAllPlugins(where);

      const filteredPlugins = plugins.filter(
        p => p.settings.allProducts || p.settings.product_id === product.id
      );
      return filteredPlugins.length > 0 ? filteredPlugins : [];
    }
    return plugins;
  }

  async getMemberkitIntegration() {
    const plugins = await findPluginsProductsEvents({
      id_product: this.id_product,
      id_rule: null,
      id_plugin: findIntegrationTypeByKey('memberkit').id,
    });
    return plugins;
  }

  async getVoxuyIntegration(id_rule) {
    const plugins = await findPluginsProductsEvents({
      id_product: this.id_product,
      id_rule,
      id_plugin: findIntegrationTypeByKey('voxuy').id,
    });
    return plugins;
  }

  async getSellFluxIntegration(id_rule) {
    const plugins = await findPluginsProductsEvents({
      id_product: this.id_product,
      id_rule,
      id_plugin: findIntegrationTypeByKey('sellflux').id,
    });
    return plugins;
  }

  async getAstronmembersIntegration(id_rule) {
    const plugins = await findPluginsProductsEvents({
      id_product: this.id_product,
      id_rule,
      id_plugin: findIntegrationTypeByKey('astronmembers').id,
    });
    return plugins;
  }

  async getCademiIntegration(id_rule) {
    const plugins = await findPluginsProductsEvents({
      id_product: this.id_product,
      id_rule,
      id_plugin: findIntegrationTypeByKey('cademi').id,
    });
    return plugins;
  }

  async getUtmifyIntegration(id_rule) {
    const plugins = await findPluginsProductsEvents({
      id_product: this.id_product,
      id_rule,
      id_plugin: findIntegrationTypeByKey('utmify').id,
    });
    return plugins;
  }

  async getFilteredPlugins(id_rule) {
    const plugins = await findPluginsProducts({
      id_product: this.id_product,
      id_rule,
    });
    const filteredActiveCampaign = plugins.filter(
      p => p.plugin.id_plugin === findIntegrationType('Active Campaign').id
    );
    const filteredLeadlovers = plugins.filter(
      p => p.plugin.id_plugin === findIntegrationType('LeadLovers').id
    );
    const filteredMailchimp = plugins.filter(
      p => p.plugin.id_plugin === findIntegrationType('MailChimp').id
    );

    return {
      filteredActiveCampaign,
      filteredLeadlovers,
      filteredMailchimp,
    };
  }

  /* example of sale  
      sale = {
        created_at: '2018-04-06T07:18:26+03:00',
        paid_at: '2018-04-06T07:18:26+03:00',
        transaction_id: '1234', //
        document_number: '08654944951',
        amount: '200.34',
        products: [{ product_name: 'curso x', quantity: '1', price: 245.5 }],
     };
    */
  /**
   * @param {String} payment_method must be 'card', 'billet','pix'
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student phone
   * @param {Object} sale a object like this { amount, created_at, document_number, paid_at, products, sale_uuid }
   */
  async approvedPayment({
    payment_method,
    email,
    full_name,
    phone = '',
    sale: { amount, created_at, document_number, paid_at, products, sale_uuid },
  }) {
    const filteredPlugins = await this.getFilteredPlugins(
      findRulesTypesByKey('approved-payment').id
    );

    const hotzappIntegration = await this.getHotzappIntegration(sale_uuid);

    await insertOnList(filteredPlugins, { full_name, email, phone });

    for await (const hotzApp of hotzappIntegration) {
      try {
        const integration = new HotzApp(hotzApp.settings.url);
        const order = {
          created_at,
          transaction_id: sale_uuid,
          document_number,
          amount,
          products,
          paid_at,
          name: full_name,
          email,
          phone,
        };
        if (payment_method === 'card') {
          await integration.paidCard(order);
        }
        if (payment_method === 'billet') {
          await integration.paidBillet(order);
        }
        if (payment_method === 'pix') {
          await integration.paidPix(order);
        }
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO HOTZAPP - COMPRA APROVADA');
        console.log(JSON.stringify(hotzApp));
        console.log(JSON.stringify(error));
      }
    }

    const voxuyIntegration = await this.getVoxuyIntegration(
      findRulesTypesByKey('approved-payment').id
    );

    for await (const voxuy of voxuyIntegration) {
      try {
        const integration = new Voxuy(voxuy.plugin.settings.api_url, voxuy.plugin.settings.api_key);
        const order = {
          created_at,
          transaction_id: `${sale_uuid}-${voxuy.id}`,
          document_number,
          amount,
          products,
          paid_at,
          name: full_name,
          email,
          phone,
          planId: voxuy.settings.plan_id,
        };
        if (payment_method === 'card') {
          await integration.paidCard(order);
        }
        if (payment_method === 'billet') {
          await integration.paidBillet(order);
        }
        if (payment_method === 'pix') {
          await integration.paidPix(order);
        }
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO VOXUY - COMPRA APROVADA');
        console.log(JSON.stringify(voxuy));
        console.log(JSON.stringify(voxuy));
      }
    }

    const memberkitIntegration = await this.getMemberkitIntegration();
    for await (const memberkit of memberkitIntegration) {
      const subscription = await Subscriptions.findOne({
        attributes: ['next_charge'],
        include: [{ association: 'sales_item', where: { uuid: sale_uuid }, attributes: ['uuid'] }],
      });
      try {
        const integration = new Memberkit(memberkit.plugin.settings.api_key);
        await integration.postUser({
          full_name: capitalizeName(full_name),
          email,
          classroom_id: memberkit.settings.classroom_list,
          subscription,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO MEMBERKIT - COMPRA APROVADA');
        console.log(JSON.stringify(memberkit));
        console.log(JSON.stringify(memberkit));
      }
    }

    const sellFluxIntegration = await this.getSellFluxIntegration(
      findRulesTypesByKey('approved-payment').id
    );

    for await (const sellflux of sellFluxIntegration) {
      try {
        const integration = new Sellflux(sellflux.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${sellflux.id}`,
          payment_date: paid_at,
          status: 'approved-payment',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO SELLFLUX - COMPRA APROVADA');
        console.log(JSON.stringify(sellflux));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('approved-payment').id
    );

    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${astron.id}`,
          payment_date: paid_at,
          status: 'approved-payment',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - COMPRA APROVADA');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }

    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('approved-payment').id
    );
    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);
        console.log('INTEGRAÇÃO CADEMI - COMPRA APROVADA', sale_uuid);
        await integration.webhook({
          id_event: findRulesTypesByKey('approved-payment').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - COMPRA APROVADA');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const utmifyIntegration = await this.getUtmifyIntegration(
      findRulesTypesByKey('approved-payment').id
    );

    for await (const utmify of utmifyIntegration) {
      try {
        const integration = new Utmify(utmify.plugin.settings.api_token);

        await integration.createOrder({
          amount,
          created_at,
          document_number,
          email,
          method: payment_method,
          name: full_name,
          paid_at,
          phone,
          product_name: products[0].product_name,
          status: 'approved-payment',
          uuid_product: products[0].uuid,
          uuid: sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO UTMIFY - COMPRA APROVADA');
        console.log(JSON.stringify(utmify));
        console.log(error);
      }
    }

    const omieIntegrations = await this.getOmieIntegration(this.id_product);
    for await (const omie of omieIntegrations) {
      await this.createOmieOrder({
        omie,
        email,
        full_name,
        phone,
        amount,
        document_number,
        products,
        sale_uuid,
      });
    }
  }

  /* example of sale  
      sale = {
        created_at: '2018-04-06T07:18:26+03:00',
        paid_at: '2018-04-06T07:18:26+03:00',
        transaction_id: '1234', //
        document_number: '08654944951',
        amount: '200.34',
        error_message: "Saldo insuficiente"
        products: [{ product_name: 'curso x', quantity: '1', price: 245.5 }],
     };
    */
  /**
   * @param {String} payment_method must be 'card', 'billet','pix'
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student phone
   * @param {Object} sale a object like this { amount, created_at, document_number, paid_at, products, sale_uuid }
   */
  async refusedPayment({
    payment_method,
    email,
    full_name,
    phone = '',
    sale: { amount, created_at, document_number, paid_at, products, sale_uuid, error_message },
  }) {
    const filteredPlugins = await this.getFilteredPlugins(
      findRulesTypesByKey('refused-payment').id
    );
    await insertOnList(filteredPlugins, { full_name, email, phone });
    const hotzappIntegration = await this.getHotzappIntegration(sale_uuid);

    for await (const hotzApp of hotzappIntegration) {
      try {
        const integration = new HotzApp(hotzApp.settings.url);
        const order = {
          created_at,
          transaction_id: sale_uuid,
          document_number,
          amount,
          products,
          paid_at,
          name: full_name,
          email,
          phone,
          error_message,
        };
        if (payment_method === 'card') {
          await integration.refusedCard(order);
        }
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO HOTZAPP - COMPRA RECUSADA');
        console.log(JSON.stringify(hotzApp));
        console.log(JSON.stringify(error));
      }
    }
    const voxuyIntegration = await this.getVoxuyIntegration(
      findRulesTypesByKey('refused-payment').id
    );
    for await (const voxuy of voxuyIntegration) {
      try {
        const integration = new Voxuy(voxuy.plugin.settings.api_url, voxuy.plugin.settings.api_key);
        const order = {
          created_at,
          transaction_id: `${sale_uuid}-${voxuy.id}`,
          document_number,
          amount,
          products,
          paid_at,
          name: full_name,
          email,
          phone,
          planId: voxuy.settings.plan_id,
        };
        if (payment_method === 'card') {
          await integration.refusedCard(order);
        }
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO VOXUY - COMPRA RECUSADA');
        console.log(JSON.stringify(voxuy));
        console.log(JSON.stringify(voxuy));
      }
    }
    const sellFluxIntegration = await this.getSellFluxIntegration(
      findRulesTypesByKey('refused-payment').id
    );
    for await (const sellflux of sellFluxIntegration) {
      try {
        const integration = new Sellflux(sellflux.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${sellflux.id}`,
          status: 'refused-payment',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO SELLFLUX - COMPRA RECUSADA');
        console.log(JSON.stringify(sellflux));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('refused-payment').id
    );
    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${astron.id}`,
          status: 'refused-payment',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - COMPRA RECUSADA');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }

    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('refused-payment').id
    );

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);

        await integration.webhook({
          id_event: findRulesTypesByKey('refused-payment').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - COMPRA RECUSADA');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const utmifyIntegration = await this.getUtmifyIntegration(
      findRulesTypesByKey('refused-payment').id
    );

    for await (const utmify of utmifyIntegration) {
      try {
        const integration = new Utmify(utmify.plugin.settings.api_token);

        await integration.createOrder({
          amount,
          created_at,
          document_number,
          email,
          method: payment_method,
          name: full_name,
          phone,
          product_name: products[0].product_name,
          status: 'refused-payment',
          uuid_product: products[0].uuid,
          uuid: sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO UTMIFY - COMPRA NEGADA');
        console.log(JSON.stringify(utmify));
        console.log(error);
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   */
  async refundedPayment({
    email,
    full_name,
    phone = '',
    payment_method,
    document_number,
    sale: { amount, products, sale_uuid },
  }) {
    const filteredPlugins = await this.getFilteredPlugins(findRulesTypesByKey('refund').id);
    await insertOnList(filteredPlugins, { full_name, email, phone });

    const sellFluxIntegration = await this.getSellFluxIntegration(findRulesTypesByKey('refund').id);
    for await (const sellflux of sellFluxIntegration) {
      try {
        const integration = new Sellflux(sellflux.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${sellflux.id}`,
          status: 'refund',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO SELLFLUX - COMPRA REEMBOLSADA');
        console.log(JSON.stringify(sellflux));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('refund').id
    );
    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${astron.id}`,
          status: 'refund',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - COMPRA REEMBOLSADA');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }

    const cademiIntegration = await this.getCademiIntegration(findRulesTypesByKey('refund').id);

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);

        await integration.webhook({
          id_event: findRulesTypesByKey('refund').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - COMPRA REEMBOLSADA');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const utmifyIntegration = await this.getUtmifyIntegration(findRulesTypesByKey('refund').id);

    for await (const utmify of utmifyIntegration) {
      try {
        const integration = new Utmify(utmify.plugin.settings.api_token);

        await integration.createOrder({
          amount,
          document_number,
          email,
          method: payment_method,
          name: full_name,
          phone,
          product_name: products[0].product_name,
          status: 'refund',
          uuid_product: products[0].uuid,
          uuid: sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO UTMIFY - COMPRA REEMBOLSADA');
        console.log(JSON.stringify(utmify));
        console.log(error);
      }
    }

    const voxuyIntegration = await this.getVoxuyIntegration(findRulesTypesByKey('refund').id);

    for await (const voxuy of voxuyIntegration) {
      try {
        const integration = new Voxuy(voxuy.plugin.settings.api_url, voxuy.plugin.settings.api_key);
        const order = {
          transaction_id: `${sale_uuid}-${voxuy.id}`,
          email,
          phone,
          name: full_name,
          planId: voxuy.settings.plan_id,
          payment_method,
        };
        await integration.canceledSubscriptionOrRefunded(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO VOXUY - COMPRA REEMBOLSADA');
        console.log(JSON.stringify(voxuy));
        console.log(JSON.stringify(voxuy));
      }
    }

    const memberkitIntegration = await this.getMemberkitIntegration();

    for await (const memberkit of memberkitIntegration) {
      try {
        const integration = new Memberkit(memberkit.plugin.settings.api_key);
        await integration.deleteUSer({
          email,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO MEMBERKIT - COMPRA REEMBOLSADA');
        console.log(JSON.stringify(memberkit));
        console.log(JSON.stringify(memberkit));
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   */
  async chargebackPayment({ email, full_name, phone = '', sale_uuid = '' }) {
    const filteredPlugins = await this.getFilteredPlugins(findRulesTypesByKey('chargeback').id);
    await insertOnList(filteredPlugins, { full_name, email, phone });

    const cademiIntegration = await this.getCademiIntegration(findRulesTypesByKey('chargeback').id);

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);

        await integration.webhook({
          id_event: findRulesTypesByKey('chargeback').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - COMPRA COM CHARGEBACK');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   */
  async canceledSubscription({
    email,
    full_name,
    phone = '',
    sale_uuid = '',
    payment_method = 'card',
  }) {
    const filteredPlugins = await this.getFilteredPlugins(
      findRulesTypesByKey('canceled-subscription').id
    );
    await insertOnList(filteredPlugins, { full_name, email, phone });

    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('canceled-subscription').id
    );

    const voxuyIntegration = await this.getVoxuyIntegration(
      findRulesTypesByKey('canceled-subscription').id
    );

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);

        await integration.webhook({
          id_event: findRulesTypesByKey('canceled-subscription').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - ASSINATURA CANCELADA');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    for await (const voxuy of voxuyIntegration) {
      try {
        const integration = new Voxuy(voxuy.plugin.settings.api_url, voxuy.plugin.settings.api_key);
        const order = {
          transaction_id: `${sale_uuid}-${voxuy.id}`,
          email,
          phone,
          name: full_name,
          planId: voxuy.settings.plan_id,
          payment_method,
        };
        await integration.canceledSubscriptionOrRefunded(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO VOXUY - ASSINATURA CANCELADA');
        console.log(JSON.stringify(voxuy));
        console.log(JSON.stringify(voxuy));
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('canceled-subscription').id
    );

    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);

        await integration.webhook({
          id_event: findRulesTypesByKey('canceled-subscription').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - ASSINATURA CANCELADA');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   */
  async lateSubscription({ email, full_name, phone = '', sale_uuid = '' }) {
    const filteredPlugins = await this.getFilteredPlugins(
      findRulesTypesByKey('late-subscription').id
    );
    await insertOnList(filteredPlugins, { full_name, email, phone });
    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('late-subscription').id
    );

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);

        await integration.webhook({
          id_event: findRulesTypesByKey('late-subscription').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - ASSINATURA ATRASADA');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('late-subscription').id
    );

    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);

        await integration.webhook({
          id_event: findRulesTypesByKey('late-subscription').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - ASSINATURA ATRASADA');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   */
  async renewedSubscription({ email, full_name, phone = '', sale_uuid = null, sale_id = null }) {
    const filteredPlugins = await this.getFilteredPlugins(
      findRulesTypesByKey('renewed-subscription').id
    );
    await insertOnList(filteredPlugins, { full_name, email, phone });

    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('renewed-subscription').id
    );

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);
        await integration.webhook({
          id_event: findRulesTypesByKey('renewed-subscription').id,
          sale_uuid,
          sale_id,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - ASSINATURA RENOVADA');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('renewed-subscription').id
    );

    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);
        await integration.webhook({
          id_event: findRulesTypesByKey('renewed-subscription').id,
          sale_uuid,
          sale_id,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - ASSINATURA RENOVADA');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }
  }

  /* example of sale  
      sale = {
        created_at: '2018-04-06T07:18:26+03:00',
        document_number: '08654944951',
        amount: '200.34',
        products: [{ product_name: 'curso x', quantity: '1', price: 245.5 }],
     };
    */
  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   * @param {Object} sale a object like this { amount, created_at, document_number, products }
   */
  async abandonedCart({
    email,
    full_name,
    phone = '',
    sale: { cart_uuid, amount, created_at, document_number, products },
  }) {
    const filteredPlugins = await this.getFilteredPlugins(findRulesTypesByKey('abandoned-cart').id);
    await insertOnList(filteredPlugins, { full_name, email, phone });
    const hotzappIntegration = await this.getHotzappIntegration();

    for await (const hotzApp of hotzappIntegration) {
      try {
        const integration = new HotzApp(hotzApp.settings.url);
        const cart = {
          created_at,
          document_number,
          amount,
          products,
          name: full_name,
          email,
          phone,
        };

        await integration.abandonedCart(cart);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO HOTZAPP - CARRINHO ABANDONADO');
        console.log(JSON.stringify(hotzApp));
        console.log(JSON.stringify(error));
      }
    }

    const voxuyIntegration = await this.getVoxuyIntegration(
      findRulesTypesByKey('abandoned-cart').id
    );
    if (voxuyIntegration.length > 0) {
      for await (const voxuy of voxuyIntegration) {
        try {
          const integration = new Voxuy(
            voxuy.plugin.settings.api_url,
            voxuy.plugin.settings.api_key
          );
          const cart = {
            created_at,
            transaction_id: `${cart_uuid}-${voxuy.id}`,
            document_number,
            amount,
            products,
            name: full_name,
            email,
            phone,
            planId: voxuy.settings.plan_id,
          };
          await integration.abandonedCart(cart);
        } catch (error) {
          console.log('ERRO: INTEGRAÇÃO VOXUY - CARRINHO ABANDONADO');
          console.log(JSON.stringify(voxuy));
          console.log(JSON.stringify(voxuy));
        }
      }
    }
    const sellFluxIntegration = await this.getSellFluxIntegration(
      findRulesTypesByKey('abandoned-cart').id
    );
    if (sellFluxIntegration.length > 0) {
      for await (const sellflux of sellFluxIntegration) {
        try {
          const integration = new Sellflux(sellflux.plugin.settings.api_url_lead);
          const order = {
            name: full_name,
            email,
            phone,
            uuid: `${cart_uuid}-${sellflux.id}`,
            status: 'abandoned-cart',
            uuid_product: products[0].uuid,
            product_name: products[0].product_name,
            amount,
          };
          await integration.webhook(order);
        } catch (error) {
          console.log('ERRO: INTEGRAÇÃO SELLFLUX - CARRINHO ABANDONADO');
          console.log(JSON.stringify(sellflux));
          console.log(error);
        }
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('abandoned-cart').id
    );
    if (astronMembersIntegration.length > 0) {
      for await (const astron of astronMembersIntegration) {
        try {
          const integration = new Astronmember(astron.plugin.settings.api_url_lead);
          const order = {
            name: full_name,
            email,
            phone,
            uuid: `${cart_uuid}-${astron.id}`,
            status: 'abandoned-cart',
            uuid_product: products[0].uuid,
            product_name: products[0].product_name,
            amount,
          };
          await integration.webhook(order);
        } catch (error) {
          console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - CARRINHO ABANDONADO');
          console.log(JSON.stringify(astron));
          console.log(error);
        }
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   * @param {Object} sale a object like this { amount, created_at, document_number,billet_url,billet_code, products }
   */
  async generatedBillet({
    email,
    full_name,
    phone = '',
    payment_method,
    sale: { amount, created_at, document_number, products, sale_uuid, billet_url, billet_barcode },
  }) {
    const filteredPlugins = await this.getFilteredPlugins(
      findRulesTypesByKey('generated-billet').id
    );
    await insertOnList(filteredPlugins, { full_name, email, phone });
    const hotzappIntegration = await this.getHotzappIntegration(sale_uuid);
    for await (const hotzApp of hotzappIntegration) {
      try {
        const integration = new HotzApp(hotzApp.settings.url);
        await integration.verifyCredentials();
        const billet = {
          created_at,
          document_number,
          transaction_id: sale_uuid,
          amount,
          products,
          name: full_name,
          email,
          phone,
          billet_barcode,
          billet_url,
        };

        await integration.printedBillet(billet);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO HOTZAPP - BOLETO GERADO');
        console.log(JSON.stringify(hotzApp));
        console.log(JSON.stringify(error));
      }
    }

    const voxuyIntegration = await this.getVoxuyIntegration(
      findRulesTypesByKey('generated-billet').id
    );
    for await (const voxuy of voxuyIntegration) {
      try {
        const integration = new Voxuy(voxuy.plugin.settings.api_url, voxuy.plugin.settings.api_key);
        const billet = {
          created_at,
          transaction_id: `${sale_uuid}-${voxuy.id}`,
          document_number,
          amount,
          products,
          name: full_name,
          email,
          phone,
          planId: voxuy.settings.plan_id,
          bar_code: billet_barcode,
          url: billet_url,
        };

        await integration.generatedBillet(billet);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO VOXUY - BOLETO GERADO');
        console.log(JSON.stringify(voxuy));
        console.log(JSON.stringify(voxuy));
      }
    }

    const sellFluxIntegration = await this.getSellFluxIntegration(
      findRulesTypesByKey('generated-billet').id
    );
    for await (const sellflux of sellFluxIntegration) {
      try {
        const integration = new Sellflux(sellflux.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${sellflux.id}`,
          status: 'pending',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
          link: billet_url,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO SELLFLUX - BOLETO GERADO');
        console.log(JSON.stringify(sellflux));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('generated-billet').id
    );
    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${astron.id}`,
          status: 'pending',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
          link: billet_url,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - BOLETO GERADO');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }

    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('generated-billet').id
    );

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);
        await integration.webhook({
          id_event: findRulesTypesByKey('generated-billet').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - BOLETO GERADO');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const utmifyIntegration = await this.getUtmifyIntegration(
      findRulesTypesByKey('generated-billet').id
    );

    for await (const utmify of utmifyIntegration) {
      try {
        const integration = new Utmify(utmify.plugin.settings.api_token);

        await integration.createOrder({
          amount,
          created_at,
          document_number,
          email,
          method: payment_method,
          name: full_name,
          phone,
          product_name: products[0].product_name,
          status: 'pending',
          uuid_product: products[0].uuid,
          uuid: sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO UTMIFY - COMPRA PENDENTE');
        console.log(JSON.stringify(utmify));
        console.log(error);
      }
    }
  }

  /**
   * @param {String} email student email
   * @param {String} full_name student full name
   * @param {String} phone student full phone
   * @param {Object} sale a object like this { amount, created_at, document_number,pix_code,pix_url, products }
   */
  async generatedPix({
    email,
    full_name,
    phone = '',
    payment_method,
    sale: { amount, created_at, document_number, products, sale_uuid, pix_code, pix_url },
  }) {
    const filteredPlugins = await this.getFilteredPlugins(findRulesTypesByKey('generated-pix').id);
    await insertOnList(filteredPlugins, { full_name, email, phone });
    const hotzappIntegration = await this.getHotzappIntegration(sale_uuid);
    for await (const hotzApp of hotzappIntegration) {
      try {
        const integration = new HotzApp(hotzApp.settings.url);
        const pix = {
          created_at,
          document_number,
          transaction_id: sale_uuid,
          amount,
          products,
          name: full_name,
          email,
          phone,
          pix_code,
          pix_url,
        };
        await integration.generatedPix(pix);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO HOTZAPP - PIX GERADO');
        console.log(JSON.stringify(hotzApp));
        console.log(JSON.stringify(error));
      }
    }

    const voxuyIntegration = await this.getVoxuyIntegration(
      findRulesTypesByKey('generated-pix').id
    );

    for await (const voxuy of voxuyIntegration) {
      try {
        const integration = new Voxuy(voxuy.plugin.settings.api_url, voxuy.plugin.settings.api_key);
        const pix = {
          created_at,
          transaction_id: `${sale_uuid}-${voxuy.id}`,
          document_number,
          amount,
          products,
          name: full_name,
          email,
          phone,
          planId: voxuy.settings.plan_id,
          url: pix_url,
        };

        await integration.generatedPix(pix);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO VOXUY - PIX GERADO');
        console.log(JSON.stringify(voxuy));
        console.log(JSON.stringify(voxuy));
      }
    }

    const sellFluxIntegration = await this.getSellFluxIntegration(
      findRulesTypesByKey('generated-pix').id
    );
    for await (const sellflux of sellFluxIntegration) {
      try {
        const integration = new Sellflux(sellflux.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${sellflux.id}`,
          status: 'pending',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
          link: pix_url,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO SELLFLUX - PIX GERADO');
        console.log(JSON.stringify(sellflux));
        console.log(error);
      }
    }

    const astronMembersIntegration = await this.getAstronmembersIntegration(
      findRulesTypesByKey('generated-pix').id
    );
    for await (const astron of astronMembersIntegration) {
      try {
        const integration = new Astronmember(astron.plugin.settings.api_url_lead);
        const order = {
          name: full_name,
          email,
          phone,
          uuid: `${sale_uuid}-${astron.id}`,
          status: 'pending',
          method: payment_method,
          uuid_product: products[0].uuid,
          product_name: products[0].product_name,
          amount,
          link: pix_url,
        };
        await integration.webhook(order);
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO ASTRON MEMBERS - PIX GERADO');
        console.log(JSON.stringify(astron));
        console.log(error);
      }
    }

    const cademiIntegration = await this.getCademiIntegration(
      findRulesTypesByKey('generated-pix').id
    );

    for await (const cademi of cademiIntegration) {
      try {
        const integration = new Cademi(cademi.plugin.settings.webhook_url);
        await integration.webhook({
          id_event: findRulesTypesByKey('generated-pix').id,
          sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO CADEMI - PIX GERADO');
        console.log(JSON.stringify(cademi));
        console.log(error);
      }
    }

    const utmifyIntegration = await this.getUtmifyIntegration(
      findRulesTypesByKey('generated-pix').id
    );

    for await (const utmify of utmifyIntegration) {
      try {
        const integration = new Utmify(utmify.plugin.settings.api_token);

        await integration.createOrder({
          amount,
          created_at,
          document_number,
          email,
          method: payment_method,
          name: full_name,
          phone,
          product_name: products[0].product_name,
          status: 'pending',
          uuid_product: products[0].uuid,
          uuid: sale_uuid,
        });
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO UTMIFY - PIX GERADO');
        console.log(JSON.stringify(utmify));
        console.log(error);
      }
    }
  }

  /**
   * Obtém integrações Omie configuradas para o produto
   * @param {Number} id_product ID do produto
   * @returns {Array} Lista de integrações Omie
   */
  async getOmieIntegration(id_product) {
    const product = await Products.findOne({
      raw: true,
      where: { id: id_product },
      attributes: ['id_user'],
    });
    if (!product) return [];
    const plugins = await findPluginsProductsEvents({
      id_plugin: findIntegrationType('Omie').id,
      id_user: product.id_user,
    });
    return plugins;
  }

  /**
   * Cria ou atualiza cliente no Omie
   * @param {Object} customerData Dados do cliente
   * @param {String} customerData.full_name Nome completo
   * @param {String} customerData.email Email
   * @param {String} customerData.phone Telefone
   * @param {String} customerData.cpf_cnpj CPF/CNPJ
   * @param {Object} customerData.address Endereço
   */
  async createOmieCustomer(customerData) {
    const omieIntegration = await this.getOmieIntegration(
      findRulesTypesByKey('customer-created').id
    );

    for await (const omie of omieIntegration) {
      try {
        const integration = new Omie(omie.plugin.settings.appKey, omie.plugin.settings.appSecret);

        await integration.verifyCredentials();

        const customer = await integration.createOrUpdateCustomer({
          nome: customerData.full_name,
          email: customerData.email,
          telefone1: customerData.phone,
          cpf_cnpj: customerData.cpf_cnpj,
          endereco: customerData.address?.street || '',
          cidade: customerData.address?.city || '',
          estado: customerData.address?.state || '',
          cep: customerData.address?.zipcode || '',
        });

        console.log('Cliente criado/atualizado no Omie:', customer);
        return customer;
      } catch (error) {
        console.log('ERRO: INTEGRAÇÃO OMIE - CRIAÇÃO DE CLIENTE');
        console.log(JSON.stringify(omie));
        console.log(error);
        throw error;
      }
    }
  }

  /**
   * Cria pedido de venda no Omie
   * @param {Object} orderData Dados do pedido
   * @param {String} orderData.customer_email Email do cliente
   * @param {Array} orderData.products Lista de produtos
   * @param {String} orderData.observacoes Observações do pedido
   */
  async createOmieOrder({ omie, products, sale_uuid }) {
    try {
      const saleItem = await Sales_items.findOne({
        raw: true,
        attributes: ['id_sale', 'id_student'],
        where: {
          uuid: sale_uuid,
        },
      });
      const sale = await Sales.findOne({
        raw: true,
        where: {
          id: saleItem.id_sale,
        },
        attributes: ['full_name', 'email', 'document_number', 'whatsapp', 'address'],
      });
      const integration = new Omie(omie.settings.app_key, omie.settings.app_secret);
      await integration.verifyCredentials();
      // Busca o cliente por email
      const customerResponse = await integration.findCustomerByCPF(sale.document_number);
      let customer = customerResponse.clientes_cadastro?.[0];
      if (!customer) {
        customer = await integration.createOrUpdateCustomer({
          uuid: saleItem.id_student,
          email: sale.email,
          document_number: sale.document_number,
          full_name: sale.full_name,
          phone: sale.whatsapp,
          city: sale.address.city,
          state: sale.address.state,
          number: sale.address.number,
          street: sale.address.street,
          zipcode: sale.address.zipcode.replace(/\D/g, ''),
        });
      }
      // Prepara os itens do pedido
      const det = [
        {
          ide: {
            codigo_item_integracao: products[0].uuid,
          },
          produto: {
            cfop: '?',
            codigo_produto: omie.settings.product_code_omie,
            descricao: products[0].product_name,
            ncm: '?',
            tipo_desconto: 'V',
            valor_desconto: 0,
            quantidade: products[0].quantity || 1,
            valor_unitario: products[0].price,
            unidade: 'UN',
          },
        },
      ];

      const order = await integration.createSalesOrder({
        codigo_cliente: customer.codigo_cliente_omie,
        det,
        sale_uuid,
        price: products[0].price,
        omie,
      });

      console.log('Pedido criado no Omie:', order);
      return order;
    } catch (error) {
      console.log('ERRO: INTEGRAÇÃO OMIE - CRIAÇÃO DE PEDIDO');
      console.log(JSON.stringify(omie));
      console.log(error);
      throw error;
    }
  }
}
