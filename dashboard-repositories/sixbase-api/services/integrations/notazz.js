const moment = require('moment');
const { capitalizeName } = require('../../utils/formatters');
const HttpClient = require('../HTTPClient');

// Link documentação -> https://app.notazz.com/docs/api_en/#nfse-cidades-atendidas
class Notazz {
  #service;

  constructor(api_key) {
    this.headers = {
      'Content-Type': 'application/json',
      API_KEY: `${api_key}`,
    };
    this.#service = new HttpClient({ baseURL: 'https://app.notazz.com/api' });
    this.api_key = api_key;
  }

  async verifyCredentials() {
    const body = {
      METHOD: 'carriers',
      PAGE: '1',
    };
    try {
      await this.#service.post('', body, {
        headers: this.headers,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async createWebhook() {
    const body = {
      METHOD: 'consult_all_webhook',
    };
    try {
      const { data } = await this.#service.post('', body, {
        headers: this.headers,
      });

      if (data) {
        for (const [key, value] of Object.entries(data)) {
          if (
            value.URL ===
            'https://nwe3xcd2g2.execute-api.sa-east-1.amazonaws.com/'
          ) {
            return true;
          }
        }
      }

      const { data: createdWeb } = await this.#service.post(
        '',
        {
          METHOD: 'create_webhook',
          URL: 'https://nwe3xcd2g2.execute-api.sa-east-1.amazonaws.com/',
        },
        {
          headers: this.headers,
        },
      );
      if (createdWeb.id && createdWeb.statusProcessamento === 'sucesso') {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async generateInvoice(
    {
      name,
      document_number,
      email,
      phone,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipcode,
      uuid_sale,
      total_price,
      freight = 0,
      sale,
    },
    {
      type,
      send_email,
      label_description = 'Não fornecido pelo vendedor',
      api_key_logistic = null,
      generate_invoice = false,
      is_upsell = false,
    },
  ) {
    const itens = sale.reduce((acc, element, index) => {
      acc[index + 1] = {
        DOCUMENT_PRODUCT_COD: element.uuid,
        DOCUMENT_PRODUCT_NAME: element.offer_name
          ? `${element.name} - (${element.offer_name})`
          : `${element.name}`,
        DOCUMENT_PRODUCT_QTD: element.qtd,
        DOCUMENT_PRODUCT_UNITARY_VALUE: Number(element.amount.toFixed(2)),
      };
      return acc;
    }, {});
    const body = {
      API_KEY: this.api_key,
      METHOD: type === 'product' ? 'create_nfe_55' : 'create_nfse',
      DESTINATION_NAME: capitalizeName(name),
      DESTINATION_TAXID: document_number,
      DESTINATION_TAXTYPE: 'F',
      DESTINATION_STREET: street,
      DESTINATION_NUMBER: number,
      DESTINATION_COMPLEMENT: complement,
      DESTINATION_DISTRICT: neighborhood,
      DESTINATION_CITY: city,
      DESTINATION_UF: state,
      DESTINATION_ZIPCODE: zipcode,
      DESTINATION_PHONE: phone,
      DESTINATION_EMAIL: email,
      DOCUMENT_BASEVALUE: Number(total_price.toFixed(2)), // total amount of order, withou freigth value
      EXTERNAL_ID: uuid_sale,
      SALE_ID: uuid_sale,
      REQUEST_ORIGIN: !is_upsell ? 'B4YOU' : 'B4YOU - UPSELL',
    };
    // type roles (string) =  'product' or 'service'
    if (type === 'product') {
      body.DOCUMENT_PRODUCT = itens;
      body.DOCUMENT_FRETE = {
        DOCUMENT_FRETE_MOD: 0,
      };
      if (freight > 0) {
        body.DOCUMENT_FRETE = {
          DOCUMENT_FRETE_MOD: 1,
          DOCUMENT_FRETE_VALUE: freight,
        };
      }
      if (api_key_logistic) {
        body.LOGISTICS = api_key_logistic;
      }
      if (generate_invoice === 'true' || generate_invoice === true) {
        body.DOCUMENT_ISSUE_DATE = moment()
          .add(30, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');
      } else {
        body.DOCUMENT_ISSUE_DATE = '2100-01-01 00:00:00';
      }
    } else {
      body.DOCUMENT_DESCRIPTION = label_description;
      if (generate_invoice === 'true' || generate_invoice === true) {
        body.TRANSMITIR = 1;
      } else {
        body.TRANSMITIR = 0;
      }
    }
    if (send_email) {
      body.DESTINATION_EMAIL_SEND = { 1: { EMAIL: email } };
    }
    const route = type === 'product' ? '/nfe' : '/nfse';
    console.log(JSON.stringify(body));
    console.log(`Route->${JSON.stringify(route)}`);
    const { data } = await this.#service.post(route, body, {
      headers: this.headers,
    });
    console.log(data);
    return data;
  }
}

module.exports = Notazz;
