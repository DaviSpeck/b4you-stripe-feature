const logger = require('../../../utils/logger');
require('custom-env').env();
const { cnpjApproval } = require('./CnpjApproval');
const { kycApproval } = require('./KycApproval');

const file = process.argv[2];
const email = process.argv[3];

switch (file) {
  case 'cnpj-approval':
    cnpjApproval(email);
    break;

  case 'kyc-approval':
    kycApproval(email);
    break;

  case 'all':
    cnpjApproval(email);
    kycApproval(email);
    break;

  default:
    logger.error('Arquivo de email não encontrado');
}
