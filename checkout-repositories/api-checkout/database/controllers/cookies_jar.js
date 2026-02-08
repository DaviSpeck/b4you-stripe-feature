const CookieJar = require('../models/Cookies_jar');

const createCookie = async (data) => CookieJar.create(data);

const findOneCookie = async (where) => CookieJar.findOne({ raw: true, where });

const findAllCookies = async (where, t = null) =>
  CookieJar.findAll({
    raw: true,
    nest: true,
    where,
    include: [
      {
        association: 'affiliate',
        attributes: ['id', 'id_user'],
        paranoid: true,
      },
    ],
    transaction: t,
  });

module.exports = {
  createCookie,
  findOneCookie,
  findAllCookies,
};
