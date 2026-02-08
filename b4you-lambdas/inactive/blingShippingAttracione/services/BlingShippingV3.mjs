// Link documentação -> https://ajuda.bling.com.br/hc/pt-br/articles/360047064693-POST-pedido
import { HttpClient } from './HTTPClient.mjs';
import cepPromise from 'cep-promise';

export class BlingV3 {
  #refreshToken;

  #generateInvoice;

  #accessToken;

  #API_BLING;

  #BLING_CLIENT_ID;
  #BLING_CLIENT_SECRET;

  constructor(refreshToken, accessToken, generateInvoice = false) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#refreshToken = refreshToken;
    this.#accessToken = accessToken;
    this.#generateInvoice = generateInvoice;

    this.#API_BLING =
      process.env.API_BLING_V3 || 'https://api.bling.com.br/v3/';
    this.#BLING_CLIENT_ID = process.env.BLING_CLIENT_ID;
    this.#BLING_CLIENT_SECRET = process.env.BLING_CLIENT_SECRET;
  }

  get #service() {
    return new HttpClient({
      baseURL: `${this.#API_BLING}`,
      headers: {
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
  }

  async refreshToken() {
    try {
      const authToken = Buffer.from(
        `${this.#BLING_CLIENT_ID}:${this.#BLING_CLIENT_SECRET}`
      ).toString('base64');

      const form = new FormData();
      form.append('grant_type', 'refresh_token');
      form.append('refresh_token', this.#refreshToken);

      const response = await this.#service.post(`oauth/token`, form, {
        headers: {
          authorization: `Basic ${authToken}`,
        },
      });

      this.#accessToken = response?.data?.access_token;

      return response.data;
    } catch (error) {
      console.log('error.response', error?.response);
      throw error;
    }
  }

  async verifyCredentials() {
    try {
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Representa um produto.
   *
   * @param {string} code - O id do produto na B4You.
   */
  async getProduct(code) {
    try {
      const {
        data: { data },
      } = await this.#service.get(`/produtos?codigo=${code}`);

      return data[0] || {};
    } catch (error) {
      return error;
    }
  }

  /**
   * Representa um produto.
   *
   * @param {Object} produto - O produto.
   * @param {string} produto.name - O nome do curso.
   * @param {string} produto.code - O código único do curso.
   * @param {number} produto.price - O preço do curso.
   */
  async createProduct({ code, name, price }) {
    try {
      const {
        data: { data },
      } = await this.#service.post(`/produtos`, {
        nome: name,
        codigo: code,
        tipo: 'P',
        situacao: 'A',
        formato: 'S',
        unidade: 'UN',
        preco: price,
      });
      return data;
    } catch (error) {
      return error;
    }
  }

  /**
   * Representa um produto.
   *
   * @param {string} productId - O id do produto na bling.
   *
   * @param {Object} produto - O produto.
   * @param {string} produto.name - O nome do curso.
   * @param {string} produto.code - O código único do curso.
   * @param {number} produto.price - O preço do curso.
   */
  async updateProduct(productId, { code, name, price }) {
    try {
      const { data } = await this.#service.put(`/produtos/${productId}`, {
        nome: name,
        codigo: code,
        tipo: 'P',
        situacao: 'A',
        formato: 'S',
        unidade: 'UN',
        preco: price,
      });
      return data;
    } catch (error) {
      return error;
    }
  }

  /**
   * Representa um produto.
   *
   * @param {string} document - O id do produto na B4You.
   */
  async getContact(document) {
    try {
      const {
        data: { data },
      } = await this.#service.get(`/contatos?numeroDocumento=${document}`);

      return data[0] || null;
    } catch (error) {
      console.log(
        'error on get a client by document: ',
        JSON.stringify(error?.response?.data)
      );
      throw error;
    }
  }

  /**
   * @param {Object} contact - Os dados de entrada.
   * @param {string} contact.name - O nome da pessoa.
   * @param {string} contact.code - O código da pessoa.
   * @param {string} contact.document - O número do documento da pessoa.
   * @param {string} contact.cellphone - O número de celular da pessoa.
   * @param {string} contact.type - O tipo da pessoa (Exemplo: "F" para Física, "J" para Jurídica).
   * @param {string} contact.email - O email da pessoa.
   * @param {Object} contact.address - O endereço da pessoa.
   * @param {string} contact.address.street - A rua do endereço.
   * @param {string} contact.address.zipcode - O CEP do endereço.
   * @param {string} contact.address.neighborhood - O bairro do endereço.
   * @param {string} contact.address.city - O município do endereço.
   * @param {string} contact.address.state - A unidade federativa do endereço.
   * @param {string} contact.address.number - O número do endereço.
   * @param {string} contact.address.complement - O complemento do endereço.
   * @param {string} contact.contactType - Os tipos de contato da pessoa.
   */
  async createContact({
    name,
    document,
    code,
    cellphone,
    email,
    address,
    contactType,
  }) {
    console.log(
      'creating contact',
      name,
      document,
      code,
      cellphone,
      email,
      address,
      contactType
    );
    try {
      const {
        data: { data },
      } = await this.#service.post(`/contatos`, {
        nome: name,
        codigo: code,
        situacao: 'A',
        numeroDocumento: document,
        celular: cellphone,
        tipo: 'F',
        email,
        endereco: {
          geral: {
            endereco: address.street,
            cep: address.zipcode,
            bairro: address.neighborhood,
            municipio: address.city,
            uf: address.state,
            numero: address.number,
            complemento: address.complement,
          },
          cobranca: {
            endereco: address.street,
            cep: address.zipcode,
            bairro: address.neighborhood,
            municipio: address.city,
            uf: address.state,
            numero: address.number,
            complemento: address.complement,
          },
        },
        tiposContato: [
          {
            descricao: contactType,
          },
        ],
      });
      return data;
    } catch (error) {
      console.log(
        'error on create client: ',
        JSON.stringify(error?.response?.data)
      );
      const fields = error?.response?.data?.error?.fields;
      let newCity = null;

      const mensagensAlvo = [
        'O valor do campo cidade (Endereço geral) não foi encontrado no sistema',
        'O valor do campo cidade (Endereço cobrança) não foi encontrado no sistema',
      ];
      if (Array.isArray(fields) && fields.length > 0) {
        const mensagemEncontrada = fields.some((field) =>
          mensagensAlvo.includes(field.msg)
        );

        if (mensagemEncontrada) {
          console.log('Mensagem de cidade inválida encontrada!');
          try {
            const r = await cepPromise(address.zipcode);
            console.log('dados da cidade', r);
            newCity = r.city;
            console.log('tentando recriar contato com a cidade correta');
            const {
              data: { data },
            } = await this.#service.post(`/contatos`, {
              nome: name,
              codigo: code,
              situacao: 'A',
              numeroDocumento: document,
              celular: cellphone,
              telefone: cellphone,
              tipo: 'F',
              email,
              endereco: {
                geral: {
                  endereco: address.street,
                  cep: address.zipcode,
                  bairro: address.neighborhood,
                  municipio: newCity,
                  uf: address.state,
                  numero: address.number,
                  complemento: address.complement,
                },
                cobranca: {
                  endereco: address.street,
                  cep: address.zipcode,
                  bairro: address.neighborhood,
                  municipio: newCity,
                  uf: address.state,
                  numero: address.number,
                  complemento: address.complement,
                },
              },
              tiposContato: [
                {
                  descricao: contactType,
                },
              ],
            });
            return data;
          } catch (e) {
            throw error;
          }
        }
      }
      throw error;
    }
  }

  prepareOrder({
    date,
    sale_uuid,
    shipping,
    shippingService,
    freight,
    clientName,
    address,
    clientId,
    items,
    installments,
  }) {
    const order = {
      numeroLoja: sale_uuid,
      data: date,
      dataSaida: date,
      contato: {
        id: clientId,
      },
      itens: items.map((item) => ({
        codigo: item.uuid,
        quantidade: item.quantity,
        desconto: item.discount_percentage,
        valor: item.amount,
        descricao: item.name,
        produto: {
          id: item.productId,
        },
      })),
      transporte: {
        fretePorConta: 0,
        frete: freight,
        quantidadeVolumes: 1,
        contato: {
          nome: shipping,
        },
        etiqueta: {
          nome: clientName,
          endereco: address.street,
          numero: address.number,
          complemento: address.complement,
          municipio: address.city,
          uf: address.state,
          cep: address.zipcode,
          bairro: address.neighborhood,
          nomePais: 'BRASIL',
        },
        volumes: [
          {
            servico: shippingService,
          },
        ],
      },
    };

    if (installments?.length > 0) {
      order.parcelas = installments.map((installment) => ({
        dataVencimento: installment.date,
        valor: installment.amount,
      }));
    }

    return order;
  }

  async createOrder({
    date,
    sale_uuid,
    shipping,
    shippingService,
    freight,
    clientName,
    address,
    clientId,
    items,
    installments,
  }) {
    const order = this.prepareOrder({
      date,
      sale_uuid,
      shipping,
      shippingService,
      freight,
      clientName,
      address,
      clientId,
      items,
      installments,
    });

    try {
      console.log('body createOrder', JSON.stringify(order, null, 4));
      const {
        data: { data },
      } = await this.#service.post(`/pedidos/vendas`, order);
      return data;
    } catch (error) {
      console.log(error?.response?.data);
      throw error;
    }
  }

  async updateOrder(
    orderId,
    {
      date,
      sale_uuid,
      shipping,
      shippingService,
      freight,
      clientName,
      address,
      clientId,
      items,
      installments,
    }
  ) {
    const order = this.prepareOrder({
      date,
      sale_uuid,
      shipping,
      shippingService,
      freight,
      clientName,
      address,
      clientId,
      items,
      installments,
    });

    try {
      console.log('body updateOrder', order);
      const {
        data: { data },
      } = await this.#service.put(`/pedidos/vendas/${orderId}`, order);
      return data;
    } catch (error) {
      console.log(error?.response?.data);
      throw error;
    }
  }

  async getPedidos() {
    const response = await this.#service.get(
      `pedidos/json/&apikey=${this.#accessToken}`
    );
    return response;
  }
}
