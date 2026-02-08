// Link documentação -> https://ajuda.bling.com.br/hc/pt-br/articles/360047064693-POST-pedido

import cepPromise from 'cep-promise';
import { HttpClient } from './HTTPClient.mjs';
export class BlingV3 {
  #refreshToken;
  #accessToken;

  #API_BLING;

  #BLING_CLIENT_ID;
  #BLING_CLIENT_SECRET;

  constructor(refreshToken, accessToken, _generateInvoice = false) {
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#refreshToken = refreshToken;
    this.#accessToken = accessToken;

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
    id_user,
    type
  }) {
    try {
      const body = {
        nome: name,
        codigo: code,
        situacao: 'A',
        numeroDocumento: document,
        celular: cellphone,
        telefone: cellphone,
        tipo: type,
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
      };
      if (id_user === 1491) {
        body.indicadorIe = 9;
      }
      console.log('body on create client', body);
      const {
        data: { data },
      } = await this.#service.post(`/contatos`, body);
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
            console.log('erro ao buscar cep', e);
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
    id_user = null,
    codShipping = null,
    payment_method = 'card',
    installments = 1,
  }) {
    let auxVolume = null;
    let auxShipping = shipping
    // loogne
    if (id_user && id_user === 1491 && codShipping) {
      auxVolume = [
        {
          servico: codShipping,
        },
      ];
      //contatonutrifred@gmail.com
    } else if (id_user && id_user === 321406 && codShipping) {
      if (codShipping === '03220') {
        auxShipping = 'Frenet'
        auxVolume = [
          {
            servico: 'COR-Sedex',
          },
        ];
      }
      if (codShipping === 'LOG') {
        auxShipping = 'Frenet'
        auxVolume = [
          {
            servico: 'LOG-Loggi',
          },
        ];
      }
      if (codShipping === '03298') {
        auxShipping = 'Frenet'
        auxVolume = [
          {
            servico: 'COR-PAC',
          },
        ];
      }
    } else if (id_user && id_user === 83821 && codShipping) { // Adm@sweettherapy.com.br
      if (codShipping === '03220') {
        auxShipping = 'Frenet'
        auxVolume = [
          {
            servico: 'COR-Sedex',
          },
        ];
      }
      if (codShipping === 'LOG') {
        auxShipping = 'Frenet'
        auxVolume = [
          {
            servico: 'LOG-Loggi',
          },
        ];
      }
      if (codShipping === '03298') {
        auxShipping = 'Frenet'
        auxVolume = [
          {
            servico: 'COR-PAC',
          },
        ];
      }
    } else if (id_user === 123058 && codShipping) { // diretoria@sejaziva.com.br
      auxVolume = [
        {
          servico: codShipping,
        },
      ];
    } else if (id_user === 71674 && codShipping) { //kanizy@hotmail.com
      if (codShipping === 'LOG') {
        auxShipping = 'loggi'
        auxVolume = [
          {
            servico: 'loggi',
          },
        ];
      }
      if (codShipping === '03298') {
        auxShipping = 'PAC'
        auxVolume = [
          {
            servico: 'PAC',
          },
        ];
      }
      if (codShipping === '03220') {
        auxShipping = 'Sedex'
        auxVolume = [
          {
            servico: 'Sedex',
          },
        ];
      }
    } else if (id_user === 135202) { //murilomarinho.mude@gmail.com
      auxShipping = 0
      auxVolume = [
        {
          servico: 'PAC CONTRATO AG',
        },
      ];
    }
    else {
      auxVolume = [
        {
          servico: shippingService,
        },
      ];
    }
    let loja = null;
    // matheusgarrido03@gmail.com
    if (id_user === 94277) {
      loja = {
        // id: 205440326,
        id: 205799808
      };
    }
    // carolina.facco5@gmail.com
    if (id_user === 4840) {
      loja = {
        id: 205446125,
      };
    }

    // camilo.ximenes83@gmail.com
    if (id_user === 142157) {
      loja = {
        id: 205300446,
      };
    }

    // guimarandrade@yahoo.com.br
    if (id_user === 365836) {
      loja = {
        id: 205645610,
      };
    }

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
          nome: auxShipping,
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
        volumes: auxVolume,
      },
    };
    if (loja) {
      order.loja = loja;
    }

    // camilo.ximenes83@gmail.com
    if (id_user === 142157) {
      const newDate = new Date(order.dataSaida);
      newDate.setDate(newDate.getDate() + 1);
      order.dataSaida = newDate.toISOString().split('T')[0];
      order.parcelas = [
        {
          dataVencimento: newDate.toISOString().split('T')[0],
          valor: order.itens.reduce((total, s) => {
            const desconto = (s.valor * (s.desconto || 0)) / 100;
            return total + (s.valor - desconto);
          }, 0),
          observacoes: `${installments}x`,
          formaPagamento: {
            id: payment_method === 'card' ? 7472146 : 7472117,
          },
        },
      ];
    }
    // diretoria@sejaziva.com.br
    if (id_user === 123058) {
      const newDate = new Date(order.dataSaida);
      newDate.setDate(newDate.getDate() + 1);
      order.dataSaida = newDate.toISOString().split('T')[0];
      order.parcelas = [{
        dataVencimento: newDate.toISOString().split('T')[0],
        valor: order.itens.reduce((total, s) => {
          const valor = parseFloat(s.valor);
          const desconto = s.desconto ? (valor * s.quantidade) * (s.desconto / 100) : 0;
          const totalItem = (valor * s.quantidade) - desconto;
          return total + totalItem;
        }, 0) + freight,
        formaPagamento: { id: 8079217 }
      }];
    }

    // Adm@sweettherapy.com.br
    if (id_user === 83821) {
      const formaPagamentoMap = {
        pix: 7991802,
        card: {
          1: 7991662,
          2: 7991842,
          3: 7991843,
          4: 7991858,
          5: 7991859,
          6: 7991868,
          7: 7991869,
          8: 7991870,
          9: 7991879,
          10: 7991880,
          11: 7991888,
          12: 7991896,
        },
      };
      const formaPagamento = {
        id:
          payment_method === "pix"
            ? formaPagamentoMap.pix
            : formaPagamentoMap.card[installments] || null,
      };
      const newDate = new Date(order.dataSaida);
      newDate.setDate(newDate.getDate() + 1);
      order.dataSaida = newDate.toISOString().split('T')[0];
      order.parcelas = [{
        dataVencimento: newDate.toISOString().split('T')[0],
        valor: order.itens.reduce((total, s) => {
          const desconto = (s.valor * (s.desconto || 0)) / 100;
          return total + ((s.valor * s.quantidade) - desconto) + freight;
        }, 0),
        observacoes: `${installments}x`,
        formaPagamento
      }]
    }
    // petskindog@gmail.com
    if (id_user === 142157) {
      order.transporte.volumes = [
        { servico: 'Mandae' }
      ]
    }
    // adv.nathaliafs@gmail.com
    // if (id_user === 338353) {
    //   order.situacao = {
    //     id: 15
    //   }
    // }

    // financeiro@or-holding.com.br
    if (id_user === 456269) {
      const newDate = new Date(order.dataSaida);
      newDate.setDate(newDate.getDate() + 1);
      order.dataSaida = newDate.toISOString().split('T')[0];
      order.parcelas = [{
        dataVencimento: newDate.toISOString().split('T')[0],
        valor: order.itens.reduce((total, s) => {
          const valor = parseFloat(s.valor);
          const desconto = s.desconto ? (valor * s.quantidade) * (s.desconto / 100) : 0;
          const totalItem = (valor * s.quantidade) - desconto;
          return total + totalItem;
        }, 0) + freight,
        formaPagamento: { id: 8805863 }
      }];
    }

    // fuegonutritionesuperfoods@gmail.com
    if (id_user === 436980 && payment_method === "pix") {
      const newDate = new Date(order.dataSaida);
      newDate.setDate(newDate.getDate() + 1);
      order.dataSaida = newDate.toISOString().split('T')[0];
      order.parcelas = [{
        dataVencimento: newDate.toISOString().split('T')[0],
        valor: order.itens.reduce((total, s) => {
          const valor = parseFloat(s.valor);
          const desconto = s.desconto ? (valor * s.quantidade) * (s.desconto / 100) : 0;
          const totalItem = (valor * s.quantidade) - desconto;
          return total + totalItem;
        }, 0) + freight,
        formaPagamento: { id: 8703677 }
      }];
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
    id_user = null,
    codShipping = null,
    installments_order = 1,
    payment_method = 'card',
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
      id_user,
      codShipping,
      installments: installments_order,
      payment_method,
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
