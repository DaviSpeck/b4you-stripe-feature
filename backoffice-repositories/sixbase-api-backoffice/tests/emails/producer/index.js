require('dotenv').config();
const logger = require('../../../utils/logger');
const { approvedCNPJ } = require('./ApprovedCnpj');
const { approvedDocuments } = require('./ApprovedDocuments');
const { reprovedCNPJ } = require('./ReprovedCNPJ');
const { reprovedDocuments } = require('./ReprovedDocuments');

const file = process.argv[2];
const email = process.argv[3] || 'daniloctg@msn.com';

switch (file) {
  case 'approved-documents':
    approvedDocuments(email);
    break;

  case 'reproved-documents':
    reprovedDocuments(email);
    break;

  case 'approved-cnpj':
    approvedCNPJ(email);
    break;

  case 'reproved-cnpj':
    reprovedCNPJ(email);
    break;

  case 'all':
    approvedCNPJ(email);
    approvedDocuments(email);
    reprovedCNPJ(email);
    reprovedDocuments(email);

    break;

  default:
    logger.error('Arquivo de email não encontrado');
}
