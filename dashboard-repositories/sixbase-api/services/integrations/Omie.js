const { default: axios } = require('axios');

class OmieService {
  constructor(appKey, appSecret) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.baseURL = 'https://app.omie.com.br/api/v1';
  }

  async makeRequest(endpoint, params) {
    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, {
        app_key: this.appKey,
        app_secret: this.appSecret,
        ...params,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Omie API Error: ${error.message}`);
    }
  }

  async createOrder(orderData) {
    const params = {
      call: 'IncluirPedido',
      param: [orderData],
    };

    return this.makeRequest('/produtos/pedido/', params);
  }

  async getProduct(productCode) {
    const params = {
      call: 'ConsultarProduto',
      param: [
        {
          codigo_produto: productCode,
        },
      ],
    };

    return this.makeRequest('/produtos/produto/', params);
  }

  async getPaymentMethod(paymentCode) {
    const params = {
      call: 'ListarFormasPagamento',
      param: [
        {
          codigo: paymentCode,
          filtrar_apenas_omiepay: 'N',
        },
      ],
    };

    return this.makeRequest('/produtos/formapagamento/', params);
  }

  async getCategory(categoryCode) {
    const params = {
      call: 'ListarCategorias',
      param: [
        {
          codigo: categoryCode,
          filtrar_apenas_omiepay: 'N',
        },
      ],
    };

    return this.makeRequest('/produtos/categoria/', params);
  }

  async getAccount(accountCode) {
    const params = {
      call: 'ListarContasReceber',
      param: [
        {
          codigo: accountCode,
          filtrar_apenas_omiepay: 'N',
        },
      ],
    };

    return this.makeRequest('/financas/contareceber/', params);
  }

  async getScenario(scenarioCode) {
    const params = {
      call: 'ListarCenarios',
      param: [
        {
          codigo: scenarioCode,
          filtrar_apenas_omiepay: 'N',
        },
      ],
    };

    return this.makeRequest('/financas/cenario/', params);
  }

  async verifyCredentials() {
    try {
      // Use a simple API call to verify credentials
      const params = {
        call: 'ListarCenarios',
        param: [
          {
            filtrar_apenas_omiepay: 'N',
          },
        ],
      };

      return await this.makeRequest('/financas/cenario/', params);
    } catch (error) {
      throw new Error('Invalid Omie credentials');
    }
  }
}

module.exports = OmieService;
