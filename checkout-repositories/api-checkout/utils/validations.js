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
  const rawDocument = document.replace(/[^\d]/g, ''); // Remove tudo que não for número
  const type = rawDocument.length === 11 ? 'CPF' : 'CNPJ'; // Determina o tipo pelo tamanho
  const valid = type === 'CPF' ? cpf.isValid(document) : cnpj.isValid(document); // Valida usando a lib
  return valid;
};

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

const removeEmojis = (string) => {
  const regex =
    /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  return string.replace(regex, '');
};

module.exports = {
  validateAndFormatDocument,
  validateDocument,
  validateEmail,
  validatePhone,
  validateUUID,
  removeEmojis,
};
