const { findIntegrationType } = require('../../../types/integrationTypes');
const { findeNotasType } = require('../../../types/eNotasTypes');

const serializeeNotasPlugin = (plugin) => {
  const {
    uuid,
    id_plugin,
    settings: {
      active,
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      send_invoice_customer_mail,
    },
  } = plugin;
  return {
    uuid,
    type: findIntegrationType(id_plugin).name,
    settings: {
      active,
      api_key,
      cancel_invoice_chargeback,
      issue_invoice,
      issue_invoice_label: findeNotasType(+issue_invoice).name,
      send_invoice_customer_mail,
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeeNotasPlugin);
    }
    return [serializeeNotasPlugin(this.data)];
  }
};
