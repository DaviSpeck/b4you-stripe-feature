const { cpf, cnpj } = require('cpf-cnpj-validator');
const ApiError = require('../error/ApiError');
const uuidHelper = require('./helpers/uuid');
const { EMAIL, PHONE } = require('./regex');

const testRegex = (data, regex) => regex.test(data);

/**
 * @typedef {object} Document
 * @property {string} document_type
 * @property {string} rawDocument
 */

/**
 * @param {string} value Ex: (contact@mango5.com)
 */
const validateEmail = (email) => testRegex(String(email).toLowerCase(), EMAIL);

/**
 * @param {string} value Ex: (+55 (47) 99999-0000)
 */
const validatePhone = (phone) => testRegex(String(phone), PHONE);

const validateDocument = (document) => {
  const rawDocument = document.replace(/[^\d]/g, '');
  const type = rawDocument.length === 11 ? 'CPF' : 'CNPJ';
  const valid =
    type === 'CPF' ? cpf.isValid(rawDocument) : cnpj.isValid(rawDocument);
  if (!valid) return false;
  return true;
};

const validateCPF = (cpfString) => cpf.isValid(cpfString);

/**
 * @param {string} document Ex: ('08654944951','CPF')
 * @param {string} type
 * @returns {Document} document
 */
const validateAndFormatDocument = (document) => {
  const rawDocument = document.replace(/[^\d]/g, '');
  const type = rawDocument.length === 11 ? 'CPF' : 'CNPJ';
  const isValid = validateDocument(document);
  if (!isValid) throw ApiError.badRequest('Documento inválido');
  return {
    document_type: type,
    rawDocument,
  };
};

const validateUUID = (id) => uuidHelper.validate(id);

const isValidObj = (obj) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (obj[key] === null) {
      return false;
    }
  }
  return true;
};

module.exports = {
  validateAndFormatDocument,
  validateDocument,
  validateEmail,
  validatePhone,
  validateUUID,
  validateCPF,
  isValidObj,
};
