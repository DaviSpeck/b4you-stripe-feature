const { Op } = require('sequelize');
const Affiliates = require('../models/Affiliates');
const Products = require('../models/Products');
const Product_affiliate_settings = require('../models/Product_affiliate_settings');
const Users = require('../models/Users');
const AffiliateClicks = require('../models/Affiliate_Clicks');

const createAffiliate = async (affiliateObj) => {
  const affiliate = await Affiliates.create(affiliateObj);
  return affiliate;
};

const findAllAffiliate = async (where) => {
  const affiliate = await Affiliates.findAll({
    nest: true,
    where,
    include: [
      {
        association: 'user',
      },
      {
        association: 'product',
      },
    ],
  });
  return affiliate;
};

const createAffiliateClick = async (affiliateClick) => {
  const response = await AffiliateClicks.create(affiliateClick);
  return response;
};

const findAffiliateClick = async (where) => {
  const affiliate = await AffiliateClicks.findOne({
    where,
  });
  return affiliate;
};

const updateAffiliateClick = async (where, data) => {
  const result = await AffiliateClicks.update(data, {
    where,
  });
  return result;
};

const findRawProductsAffiliates = async (where) => {
  const affiliate = await Affiliates.findAll({
    nest: true,
    where,
    group: ['id_product', 'id_user'],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
      },
    ],
  });
  return affiliate;
};

const findRawProductsAffiliatesWebhooks = async (where) => {
  const affiliate = await Affiliates.findAll({
    nest: true,
    where,
    group: ['id_product'],
    attributes: ['id_user', 'id_product', 'status'],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
        attributes: ['name', 'uuid', 'id_type', 'id'],
      },
    ],
  });
  return affiliate;
};

const findAffiliateProduct = async (where) => {
  const affiliate = await Affiliates.findOne({
    nest: true,
    where,
    attributes: ['id_user', 'id_product', 'status'],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
        attributes: ['uuid'],
      },
    ],
  });
  return affiliate;
};

const findOneAffiliate = async (where) => {
  const affiliate = await Affiliates.findOne({
    raw: true,
    nest: true,
    where,
    include: [
      {
        model: Products,
        as: 'product',
        include: [
          { model: Product_affiliate_settings, as: 'affiliate_settings' },
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
      {
        model: Users,
        as: 'user',
      },
    ],
  });
  return affiliate;
};

const findAllProducerAffiliates = async (id_user, where) => {
  const affiliate = await Affiliates.findAll({
    raw: true,
    nest: true,
    where,
    include: [
      {
        model: Products,
        as: 'product',
        attributes: ['name', 'uuid'],
        where: { id_user },
      },
      {
        model: Users,
        as: 'user',
        attributes: ['first_name', 'last_name'],
      },
    ],
  });
  return affiliate;
};

const findFilteredAffiliates = async ({
  id_user,
  product_uuid,
  id_status,
  input,
}) => {
  let where = {};
  if (product_uuid) where = { ...where, '$product.uuid$': product_uuid };
  if (id_status) {
    where.status = id_status;
  }
  if (input) {
    let orObject = {
      '$user.first_name$': { [Op.like]: `%${input}%` },
      '$user.last_name$': { [Op.like]: `%${input}%` },
      '$user.email$': { [Op.like]: `%${input}%` },
    };
    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0) {
      orObject = {
        ...orObject,
        '$user.document_number$': {
          [Op.like]: `%${sanitizedInput}%`,
        },
      };
    }
    where = {
      ...where,
      [Op.or]: orObject,
    };
  }
  const affiliates = await Affiliates.findAndCountAll({
    nest: true,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    include: [
      {
        model: Products,
        as: 'product',
        attributes: ['name', 'uuid'],
        where: { id_user },
      },
      {
        model: Users,
        as: 'user',
        attributes: ['first_name', 'last_name'],
      },
    ],
  });
  return { rows: affiliates.rows, count: affiliates.count.length };
};

const updateAffiliate = async (where, affiliateObj) => {
  const Affiliate = await Affiliates.update(affiliateObj, {
    where,
  });
  return Affiliate;
};

module.exports = {
  createAffiliate,
  findAllAffiliate,
  findAllProducerAffiliates,
  findFilteredAffiliates,
  findOneAffiliate,
  findRawProductsAffiliates,
  updateAffiliate,
  findRawProductsAffiliatesWebhooks,
  findAffiliateProduct,
  findAffiliateClick,
  updateAffiliateClick,
  createAffiliateClick,
};
