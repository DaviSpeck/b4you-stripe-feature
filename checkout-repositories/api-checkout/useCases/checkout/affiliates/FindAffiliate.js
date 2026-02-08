const { Op } = require('sequelize');
const { DATABASE_DATE } = require('../../../types/dateTypes');
const dateHelper = require('../../../utils/helpers/date');
const { findAllCookies } = require('../../../database/controllers/cookies_jar');
const Users = require('../../../database/models/Users');
const Affiliates = require('../../../database/models/Affiliates');

const FIRST_CLICK = 1;

module.exports = class FindAffiliate {
  #sixid;

  #id_product;

  #affiliate_settings;

  #dbTranscation;

  #b4f;

  constructor(
    { sixid, affiliate_settings, id_product, b4f },
    dbTranscation = null,
  ) {
    this.#affiliate_settings = affiliate_settings;
    this.#sixid = sixid;
    this.#id_product = id_product;
    this.#dbTranscation = dbTranscation;
    this.#b4f = b4f;
  }

  async execute() {
    let affiliate = null;
    if (this.#b4f) {
      affiliate = await Affiliates.findOne({
        raw: true,
        attributes: ['id', 'id_user'],
        // eslint-disable-next-line
        logging: console.log,
        where: {
          uuid: this.#b4f,
          status: 2,
          id_product: this.#id_product,
        },
      });
    }

    if (!affiliate && this.#sixid) {
      const cookiesEntries = await findAllCookies(
        {
          sixid: this.#sixid,
          id_product: this.#id_product,
          max_age: {
            [Op.gte]: dateHelper().format(DATABASE_DATE),
          },
        },
        this.#dbTranscation,
      );
      if (cookiesEntries.length > 0) {
        if (this.#affiliate_settings.click_attribution === FIRST_CLICK) {
          affiliate = cookiesEntries[0].affiliate;
        } else {
          affiliate = cookiesEntries.pop().affiliate;
        }
      }
    }

    if (!affiliate) {
      return null;
    }

    const affiliateUser = await Users.findOne({
      raw: true,
      where: {
        id: affiliate.id_user,
      },
      attributes: [
        'verified_id',
        'verified_company_pagarme',
        'verified_pagarme',
        'verified_company_pagarme_3',
        'verified_pagarme_3',
      ],
    });

    affiliate.user = affiliateUser;

    return affiliate;
  }
};
