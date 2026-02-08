// Link documentação -> https://tiny.com.br/api-docs/api2-pedidos-incluir
import { PluginsLogs } from '../database/models/Plugins_logs.mjs';
import { HttpClient } from './HTTPClient.mjs';

const { API_TINY = 'https://api.tiny.com.br/api2/' } = process.env;

export class Tiny {
  #service;
  #apiKey;

  constructor(apiKey) {
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    this.#apiKey = apiKey;
    this.#service = new HttpClient({
      baseURL: `${API_TINY}`,
    });
  }

  async verifyCredentials() {
    try {
      const response = await this.#service.get('info.php', {
        params: {
          token: this.#apiKey,
          formato: 'json',
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async createSale({
    date,
    id_user,
    id_plugin,
    shippingService,
    methods_shipping,
    discount_amount,
    shipping_price,
    operation_nature,
    client: {
      name,
      document_type,
      cpf,
      address,
      number,
      complement,
      neighborhood,
      zipcode,
      city,
      state,
      phone,
      email,
    },
    items,
  }) {
    const itens = items.map((element) => ({
      codigo: element.uuid,
      descricao: element.name,
      quantidade: element.quantity.toString(),
      id_produto: element.productId,
      unidade: 'UN',
      valor_unitario: element.amount,
    }));

    const order = {
      pedido: {
        data_pedido: `${String(date.getDate()).padStart(2, '0')}/${String(
          date.getMonth() + 1
        ).padStart(2, '0')}/${date.getFullYear()}`,
        data_prevista: `${String(date.getDate()).padStart(2, '0')}/${String(
          date.getMonth() + 1
        ).padStart(2, '0')}/${date.getFullYear()}`,
        situacao: 'aprovado',
        nome_transportador: shippingService,
        forma_envio: methods_shipping,
        nome_natureza_operacao: operation_nature,
        valor_desconto: discount_amount,
        cliente: {
          nome: name,
          tipo_pessoa: document_type,
          cpf_cnpj: cpf,
          endereco: address,
          numero: number,
          complemento: complement,
          bairro: neighborhood,
          cep: zipcode,
          cidade: city,
          uf: state,
          fone: phone,
          email,
        },
        itens: itens.map((item) => ({
          item: {
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: item.unidade,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
          },
        })),
      },
    };
    if (id_user !== 199915) {
      order.pedido.valor_frete = shipping_price
    }
    if (id_user === 299850) {
      order.pedido.forma_envio = "GATEWAY";
    }
    console.log('body tiny ->', order)
    const response = await this.#service.get('pedido.incluir.php', {
      params: {
        token: this.#apiKey,
        pedido: JSON.stringify(order),
        formato: 'json',
      },
    });
    if (response.data.retorno.status !== 'OK') {
      await PluginsLogs.create({
        id_user: id_user,
        id_plugin: id_plugin,
        method: 'GET',
        url: `${API_TINY}pedido.incluir.php`,
        headers: JSON.stringify(response.request?._header),
        body: JSON.stringify({}),
        response: JSON.stringify(response?.data.retorno.erros),
        status_code: response?.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('Erro logado');
      throw new Error(error);
    }
    return response;
  }

  async updateSaleStatus(situacao, id_product, id_user, id_plugin) {
    const response = await this.#service.get('pedido.alterar.situacao', {
      params: {
        token: this.#apiKey,
        id: id_product,
        situacao: situacao,
        formato: 'json',
      },
    });
    if (response.data.retorno.status_processamento === '3') {
      console.log(`Pedido na tiny: ${id_product} foi cancelado`);
      return;
    }
    await PluginsLogs.create({
      id_user: id_user,
      id_plugin: id_plugin,
      method: 'GET',
      url: `${API_TINY}pedido.alterar.situacao`,
      headers: JSON.stringify(response.request?._header),
      body: JSON.stringify({}),
      response: JSON.stringify(response?.data.retorno.erros),
      status_code: response?.status,
      is_manual_resend: false,
      resent: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('Erro logado');
    throw new Error(error);
  }

  //em desenvolvimento
  // async updateOrder(
  //   orderId,
  //   { date, sale_uuid, shipping, shippingService, freight, clientName, address, clientId, items }
  // ) {
  //   const order = {
  //     dados_pedido: {
  //       data_prevista: '',
  //       data_envio: '',
  //       obs: '',
  //       obs_interna: '',
  //     },
  //   };
  //
  //   try {
  //     console.log('body updateOrder', order);
  //     const {
  //       data: { data },
  //     } = await this.#service.put(
  //       'pedido.alterar.php',
  //       {
  //         params: {
  //           token: this.#apiKey,
  //           id: orderId,
  //         },
  //       },
  //       order
  //     );
  //     return data;
  //   } catch (error) {
  //     console.log(error?.response?.data);
  //     throw error;
  //   }
  // }

  async createProduct({ code, name, price, id_product, id_user, id_plugin }) {
    const products = {
      produtos: [
        {
          produto: {
            codigo: code,
            nome: name,
            origem: 0,
            preco: price,
            sequencia: id_product,
            situacao: 'A',
            tipo: 'P',
            unidade: 'UN',
          },
        },
      ],
    };

    const response = await this.#service.get('produto.incluir.php', {
      params: {
        token: this.#apiKey,
        produto: JSON.stringify(products),
        formato: 'json',
      },
    });
    if (
      response.data.retorno.status_processamento === '3' &&
      response.data.retorno.registros &&
      response.data.retorno.registros[0].registro
    ) {
      console.log(response.data.retorno.registros[0].registro.id);
      return { id: response.data.retorno.registros[0].registro.id };
    }
    await PluginsLogs.create({
      id_user: id_user,
      id_plugin: id_plugin,
      method: 'GET',
      url: `${API_TINY}produto.incluir.php`,
      headers: JSON.stringify(response.request?._header),
      body: JSON.stringify({}),
      response: JSON.stringify(response?.data.retorno.erros),
      status_code: response?.status,
      is_manual_resend: false,
      resent: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log('Erro logado');
    throw new Error(error);
  }

  async getProduct(code) {
    try {
      const response = await this.#service.get('produto.obter.php', {
        params: {
          token: this.#apiKey,
          id: code,
          formato: 'json',
        },
      });
      if (response.data.retorno.status_processamento === '3' && response.data.retorno.produto) {
        // Retorna o ID do produto
        return { id: response.data.retorno.produto.id };
      }
      return response;
    } catch (error) {
      return error;
    }
  }

  async searchProduct(code) {
    try {
      const response = await this.#service.get('produtos.pesquisa.php', {
        params: {
          token: this.#apiKey,
          pesquisa: code,
          formato: 'json',
        },
      });
      if (response.data.retorno.status_processamento === '3' && response.data.retorno.produtos) {
        return { id: response.data.retorno.produtos[0].produto.id };
      }
    } catch (error) {
      return error;
    }
  }
}
