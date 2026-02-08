const HTTPClient = require('./HTTPClient');
const DateHelper = require('../utils/helpers/date');
const { FRONTEND_DATE } = require('../types/dateTypes');

const { API_PAY42_URL, API_PAY42_KEY } = process.env;
const URL_REFUND_CALLBACK = 'https://api-b4.b4you.com.br/api/callbacks/refunds';

const parserType = (type) => {
  if (type === 'created') return 'Criado';
  if (type === 'refunded') return 'Erro no processamento';
  if (type === 'failed') return 'Falhou';
  if (type === 'sending') return 'Processando';
  if (type === 'success') return 'Concluído com sucesso';
  if (type === 'resending') return 'O banco receptor encontrou um erro interno';
  return `Não identificado - ${type}`;
};

const parseErrors = (error) => {
  if (error === 'Informed tax ID does not match account owner')
    return 'O CPF/CNPJ informado não confere com o da conta de destinatário\n';

  if (error === 'Invalid CPF or CNPJ') return 'O CPF/CNPJ é inválido\n';

  if (error === 'Target account is blocked')
    return 'A conta beneficiária está bloqueada\n';

  if (error === 'Invalid account number')
    return 'Agencia ou conta bancária inválida\n';

  return `Erro desconhecido: ${error}`;
};

class PaymentService {
  #service;

  #apikey;

  constructor(service, apiKey) {
    this.#service = service;
    this.#apikey = apiKey;
  }

  async getWithdrawalPspId(pspid) {
    const { data } = await this.#service.get(`/payout/logs?id=${pspid}`, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    const response = [];

    for (const info of data) {
      response.push({
        created_at: DateHelper(info.created).format(FRONTEND_DATE),
        type: parserType(info.type),
        errors:
          info.errors.length > 0
            ? info.errors.map((name) => parseErrors(name))
            : null,
      });
    }
    return response.reverse();
  }

  async refundPix({ psp_id, refund_id, amount = null }) {
    const body = {
      refund_id,
      id: psp_id,
      webhook: URL_REFUND_CALLBACK,
    };
    if (amount) {
      body.amount = amount;
    }
    const { data } = await this.#service.post('/refunds/pix', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async refundBillet({
    refund_id,
    psp_id,
    amount,
    bank: { bank_name, ispb, account_agency, account_number },
  }) {
    const body = {
      refund_id,
      id: psp_id,
      bank: {
        type: 'PIX',
        bank_name,
        ispb,
        account_agency,
        account_number,
      },
      webhook: URL_REFUND_CALLBACK,
    };
    if (amount) {
      body.amount = amount;
    }
    const { data } = await this.#service.post('/refunds/boleto', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }

  async refundCard({
    refund_id,
    psp_id,
    webhook = URL_REFUND_CALLBACK,
    amount,
  }) {
    const body = {
      id: psp_id,
      refund_id,
      webhook,
      amount,
    };
    const { data } = await this.#service.post('/refunds/card', body, {
      headers: {
        Authorization: this.#apikey,
      },
    });
    return data;
  }
}

module.exports = new PaymentService(
  new HTTPClient({
    baseURL: API_PAY42_URL,
  }),
  API_PAY42_KEY,
);
