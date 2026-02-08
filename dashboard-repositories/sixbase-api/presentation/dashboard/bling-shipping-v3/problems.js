const { capitalizeName } = require('../../../utils/formatters');

const errorTranslationMap = {
  invalid_grant: 'Sessão expirada. Faça login novamente.',
  'Refresh token has expired':
    'O token de acesso expirou. Faça login novamente.',
  TOO_MANY_REQUESTS: 'Muitas requisições. Aguarde e tente novamente.',
  FORBIDDEN: 'Acesso negado. Verifique permissões ou status da empresa.',
};
function parseErrorMessage(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const error = data?.error;

    if (!error) return 'Erro desconhecido.';

    const messageTranslated =
      errorTranslationMap[error.message] || error.message;

    let message = `${messageTranslated}${
      error.description ? ` – ${error.description}` : ''
    }`;

    if (Array.isArray(error.fields) && error.fields.length > 0) {
      message += `\n\nDetalhes:\n`;
      error.fields.forEach((field) => {
        message += `- ${field.msg}\n`;
      });
    }

    return message;
  } catch (e) {
    return 'Erro ao interpretar a mensagem de erro.';
  }
}
const serializeBlingProblems = (plugin) => {
  const { sale, id, created_at, reason } = plugin;
  return {
    id,
    customer_name: capitalizeName(sale.full_name),
    customer_email: sale.email,
    created_at,
    paid_at: sale.products[0].paid_at,
    problem: parseErrorMessage(reason),
    value: sale.products[0].price,
    uuid: sale.products[0].uuid,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeBlingProblems);
    }
    return serializeBlingProblems(this.data);
  }
};
