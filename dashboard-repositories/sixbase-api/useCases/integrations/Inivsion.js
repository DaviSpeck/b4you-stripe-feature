const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const Plugins = require('../../database/models/Plugins');
const Plugins_products = require('../../database/models/Plugins_products');

const Invision = require('../../services/integrations/Invision');

module.exports = class InvisionSubscription {
  constructor({ id_user, id_product, student_email }) {
    this.id_product = id_product;
    this.id_user = id_user;
    this.student_email = student_email;
  }

  async execute() {
    const integration = await Plugins.findOne({
      where: {
        id_user: this.id_user,
        id_plugin: findIntegrationTypeByKey('invision').id,
      },
    });
    if (!integration) return;
    const plugin_product = await Plugins_products.findOne({
      where: { id_plugin: integration.id, id_product: this.id_product },
    });
    if (!plugin_product) return;
    const credentials = new Invision(
      integration.settings.api_url,
      integration.settings.api_key,
    );
    await credentials.deleteMemberGroup({ email: this.student_email });
  }
};
