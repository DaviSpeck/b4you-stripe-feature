const { createHash } = require('crypto');
const _ = require('lodash');
const { validateEmail } = require('./validations');

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * @param {string} value Ex: (100.53)
 */
const formatBRL = (value) => formatter.format(value).replace(/^(\D+)/, '$1');

/**
 * @param {string} value Ex: (danilo de maria)
 * @return {string} value Danilo de Maria
 */
const capitalizeName = (name) => {
  if (!name) return '';
  name = name
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
  const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(
        `\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`,
        'g',
      ),
      prepos[i],
    );
  }

  return name;
};

const splitFullName = (name) => ({
  firstName: name.split(' ')[0],
  lastName: name.substring(name.split(' ')[0].length).trim(),
});

/**
 * @param {string} value Ex: (Curso de Python é incrível)
 * @return {string} value curso-de-python-e-incrivel
 */
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    // eslint-disable-next-line
    .replace(/[^\a-z0-9\-]+/g, '')
    // eslint-disable-next-line
    .replace(/\-\-+/g, '-');

/**
 *
 * @param {string} document
 * @param {string} type
 * @returns {string} formattedDocument
 */
const formatDocument = (document) => {
  if (!document) throw new Error('document null or undefined');
  const type = document.length === 11 ? 'CPF' : 'CNPJ';
  if (type === 'CPF')
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return document.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  );
};

const formatPhone = (phone) => {
  const formattedPhone = phone.replace(/[^\d]/g, '');
  return formattedPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const isEmailInvalid = (email) => !validateEmail(email);

const transformEmailToName = (email) => {
  if (!email) throw new Error('Expect email to be not undefined or null');
  if (typeof email !== 'string') throw new Error('email must be a string');
  if (isEmailInvalid(email)) throw new Error('email is invalid');
  return email.substring(0, email.lastIndexOf('@'));
};

const formatWhatsapp = (whatsapp) => whatsapp.trim().replace(/\D/g, '');

const formatName = (name) => name.trim().replace(/\s\s+/g, ' ').toLowerCase();

const stringToBase64 = (string) => Buffer.from(string).toString('base64');

const SHA256 = (data) => createHash('sha256').update(data).digest('hex');

const floatAmountToInteger = (amount) => _.round(amount * 100) || 0;

const getRawDocument = (document) => document.replace(/[^\d]/g, '');

module.exports = {
  floatAmountToInteger,
  capitalizeName,
  formatBRL,
  slugify,
  formatDocument,
  formatPhone,
  transformEmailToName,
  formatWhatsapp,
  formatName,
  splitFullName,
  stringToBase64,
  SHA256,
  getRawDocument,
};
