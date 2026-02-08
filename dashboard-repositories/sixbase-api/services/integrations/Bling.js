// Link documentação -> https://ajuda.bling.com.br/hc/pt-br/articles/360046423414-POST-nfce
const convert = require('xml-js');
const HTTPClient = require('../HTTPClient');

const { API_BLING } = process.env;

class Bling {
  #service;

  #apiKey;

  constructor(apiKey) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#apiKey = apiKey;
    this.#service = new HTTPClient({
      baseURL: `${API_BLING}`,
    });
  }

  async verifyCredentials() {
    try {
      const response = await this.#service.get(`notasfiscais/json/`, {
        params: {
          apikey: this.#apiKey,
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  /**
   * @param {array} sale array of object like this -> [{name: 'caneta', qtd: 1, amount: 1.50}]
   * @param {array} installments array of object like this -> [{days: 10, qtd: 'DD/MM/YYYY', amount: 50.79}]
   */
  async createNFCe({
    nat_operacao,
    client: {
      name,
      type = 'F', // J ou F
      cpf,
      email,
      address: {
        street,
        number,
        complement = '',
        neighborhood = '',
        zipcode,
        city,
        state,
        phone = '',
      },
      sale,
      installments = [],
      freight,
    },
  }) {
    const itens = sale.map((element, index) => ({
      tipo: 'P',
      un: 'un',
      descricao: element.name,
      qtde: element.qtd,
      vlr_unit: element.amount,
      codigo: index + 1,
    }));
    const order = {
      pedido: {
        nat_operacao,
        cliente: {
          nome: name,
          tipo_pessoa: type,
          cpf_cnpj: cpf,
          endereco: street,
          numero: number,
          complemento: complement,
          bairro: neighborhood,
          cep: zipcode,
          cidade: city,
          uf: state,
          fone: phone,
          email,
        },
        itens: {
          item: itens,
        },
      },
    };
    if (installments.length > 0) {
      const parcel = installments.map((element) => ({
        dias: element.days,
        data: element.date,
        vlr: element.amount,
      }));
      order.pedido.parcelas.parcela = parcel;
    }
    if (freight) {
      order.vlr_frete = freight;
    }
    try {
      const options = { compact: true, ignoreComment: true, spaces: 4 };
      const result = convert.js2xml(order, options);
      const response = await this.#service.post(
        `notafiscal/xml/?apikey=${this.#apiKey}&xml=${result}`,
      );
      return response;
    } catch (error) {
      return error;
    }
  }

  async getNFCes() {
    const response = await this.#service.get(
      `notasfiscais/json/&apikey=${this.#apiKey}`,
    );
    return response;
  }
}

module.exports = Bling;
