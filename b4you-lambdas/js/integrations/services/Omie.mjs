import { date } from '../utils/date.mjs';
import { HttpClient } from './HTTPClient.mjs';

export class Omie {
  #service;

  constructor(appKey, appSecret) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.baseURL = 'https://app.omie.com.br/api/v1';
    this.#service = new HttpClient({ baseURL: this.baseURL });
  }

  /**
   * Verifica as credenciais da API
   * @returns {Promise<Object>} Resposta da verificação
   */
  async verifyCredentials() {
    try {
      const response = await this.#service.post('/geral/status/', {
        app_key: this.appKey,
        app_secret: this.appSecret,
      });
      return response;
    } catch (error) {
      throw new Error(`Erro ao verificar credenciais Omie: ${error.message}`);
    }
  }

  /**
   * Cria ou atualiza um cliente
   * @param {Object} customerData Dados do cliente
   * @param {string} customerData.id Identificação do cliente
   * @param {string} customerData.full_name Nome do cliente
   * @param {string} customerData.email Email do cliente
   * @param {string} customerData.phone Telefone do cliente
   * @param {string} customerData.document_number CPF/CNPJ do cliente
   * @param {string} customerData.street Rua do cliente
   * @param {string} customerData.neighborhood Bairro do cliente
   * @param {string} customerData.number Número do endereço do cliente
   * @param {string} customerData.city Cidade do cliente
   * @param {string} customerData.state Estado do cliente
   * @param {string} customerData.zipcode CEP do cliente
   * @returns {Promise<Object>} Cliente criado/atualizado
   */
  async createOrUpdateCustomer({
    id,
    email,
    full_name,
    phone,
    document_number,
    street,
    number,
    neighborhood,
    city,
    state,
    zipcode,
  }) {
    try {
      const body = {
        app_key: this.appKey,
        app_secret: this.appSecret,
        call: 'IncluirCliente',
        param: [
          {
            codigo_cliente_integracao: `${id}`,
            tipo_pessoa: 'F',
            razao_social: full_name,
            nome_fantasia: full_name,
            cnpj_cpf: document_number,
            endereco: {
              logradouro: street,
              numero: number,
              bairro: neighborhood,
              cidade: city,
              uf: state,
              cep: zipcode,
            },
            contato: [
              {
                nome: full_name,
                telefone1: phone,
                email,
              },
            ],
          },
        ],
      };

      const response = await this.#service.post('/geral/clientes/', body);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao criar/atualizar cliente Omie: ${error.message}`);
    }
  }

  /**
   * Busca um cliente por cpf
   * @param {string} cpf CPF do cliente
   * @returns {Promise<Object>} Cliente encontrado
   */
  async findCustomerByCPF(cpf) {
    try {
      const body = {
        app_key: this.appKey,
        app_secret: this.appSecret,
        call: 'ListarClientes',
        param: [
          {
            clientesFiltro: {
              cnpj_cpf: cpf,
            },
            registros_por_pagina: 1,
            pagina: 1,
          },
        ],
      };

      const response = await this.#service.post('/geral/clientes/', body);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao buscar cliente Omie: ${error.message}`);
    }
  }

  async createSalesOrder({ omie, sale_uuid, codigo_cliente, det, price }) {
    try {
      const body = {
        app_key: this.appKey,
        app_secret: this.appSecret,
        call: 'IncluirPedido',
        param: [
          {
            cabecalho: {
              codigo_pedido_integracao: sale_uuid,
              data_previsao: date().format('DD/MM/YYYY'),
              etapa: '10',
              numero_pedido: '',
              quantidade_itens: det.length,
              codigo_parcela: '999',
              codigo_cliente,
            },
            det,
            informacoes_adicionais: {
              codigo_categoria: omie.settings.category_code_omie,
              codigo_conta_corrente: omie.settings.account_code_omie,
              consumidor_final: 'S', // “S” = consumidor final, “N” = revenda
              enviar_email: 'N',
              codigo_cenario_impostos: omie.settings.scenario_code_omie,
            },
            lista_parcelas: {
              parcela: {
                valor: price,
                percentual: 100,
                numero_parcela: 1,
                data_vencimento: date().format('DD/MM/YYYY'),
              },
            },
          },
        ],
      };

      const response = await this.#service.post('/produtos/pedido/', body);
      return response.data;
    } catch (error) {
      console.dir(error, { depth: null });
      throw new Error(`Erro ao criar pedido Omie: ${error.message}`);
    }
  }
}
