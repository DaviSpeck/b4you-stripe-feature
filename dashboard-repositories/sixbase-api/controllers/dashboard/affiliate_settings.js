const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const SerializeSettings = require('../../presentation/dashboard/affiliateSettings');
const { updateProduct } = require('../../database/controllers/products');
const { findType } = require('../../types/commissionsAffiliatesRules');
const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const {
  updateProductAffiliateSettings,
  findOneProductAffiliateSettings,
} = require('../../database/controllers/product_affiliate_settings');
const {
  findAllProductOffers,
} = require('../../database/controllers/product_offer');
const CoproductionsRepository = require('../../repositories/sequelize/CoproductionsRepository');
const Products = require('../../database/models/Products');
const Affiliates = require('../../database/models/Affiliates');
const Product_affiliation = require('../../database/models/Product_affiliations');
const { capitalizeName } = require('../../utils/formatters');

const updateAffiliateSettingsController = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { click_attribution, allow_affiliate, list_on_market },
  } = req;
  try {
    if (
      !req.body.cookies_validity &&
      [null, undefined].includes(req.body.cookies_validity)
    ) {
      delete req.body.cookies_validity;
    }
    req.body.click_attribution = findType(click_attribution).id;
    await updateProductAffiliateSettings(id_product, req.body);
    await updateProduct(id_product, { allow_affiliate, list_on_market });
    return res.status(200).send({
      success: true,
      message: 'As configurações de afiliados do produto foram atualizadas',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getAffiliateSettingsController = async (req, res, next) => {
  const {
    product: {
      id: id_product,
      allow_affiliate,
      id_status_market,
      list_on_market,
    },
  } = req;
  try {
    const affiliateSettings = await findOneProductAffiliateSettings({
      id_product,
    });
    const coproductions = await CoproductionsRepository.findAll({
      id_product,
      status: findCoproductionStatus('Ativo').id,
    });
    affiliateSettings.coproductions = coproductions;
    const product_offer = await findAllProductOffers({ id_product });
    if (!affiliateSettings)
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'As configurações de afiliado do produto não foram encontradas',
        }),
      );

    return res.status(200).send(
      new SerializeSettings({
        ...affiliateSettings,
        allow_affiliate,
        product_offer,
        id_status_market,
        list_on_market,
      }).adapt(),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getProductsAffiliate = async (req, res) => {
  const {
    product: { id },
    user: { id: id_user },
  } = req;
  try {
    const products = await Products.findAll({
      raw: true,
      attributes: ['id', 'name'],
      where: {
        id: {
          [Op.notIn]: [id],
        },
        allow_affiliate: true,
        id_user,
      },
    });

    return res.status(200).send(
      products.map((p) => ({
        ...p,
        name: capitalizeName(p.name),
      })),
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const getSelectedProductsAffiliate = async (req, res) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const products = await Product_affiliation.findAll({
      raw: true,
      nest: true,
      where: { id_product },
      include: [
        {
          association: 'product_affiliation',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.status(200).send(
      products.map((p) => ({
        id: p.product_affiliation.id,
        name: capitalizeName(p.product_affiliation.name),
      })),
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const createProductAffiliations = async (req, res) => {
  const {
    product: { id },
    body: { id_product: id_product_affiliation },
  } = req;
  try {
    if (id === id_product_affiliation) {
      throw ApiError.badRequest('Produto deve ser diferente');
    }
    const alreadyLinked = await Product_affiliation.findOne({
      raw: true,
      where: { id_product: id, id_product_affiliation },
    });
    if (alreadyLinked) {
      throw ApiError.badRequest('Produto já linkado');
    }
    await Product_affiliation.create({
      id_product: id,
      id_product_affiliation,
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    console.log(error);
    return res.sendStatus(500);
  }
};

const deleteProductAffiliation = async (req, res) => {
  const {
    product: { id },
    params: { id_product },
  } = req;
  try {
    await Product_affiliation.destroy({
      where: { id_product: id, id_product_affiliation: id_product },
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const applyBulkCommissionController = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { commission, scope },
  } = req;

  try {
    const value = Number(commission);
    if (!Number.isFinite(value)) {
      return next(ApiError.badRequest('invalid commission'));
    }
    await Affiliates.update({ commission: value }, { where: { id_product } });

    await updateProductAffiliateSettings(id_product, { commission: value });

    return res.status(200).send({
      success: true,
      commission: value,
      scope,
      message: 'Comissão para todos aplicada',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports = {
  getAffiliateSettingsController,
  updateAffiliateSettingsController,
  getProductsAffiliate,
  getSelectedProductsAffiliate,
  createProductAffiliations,
  deleteProductAffiliation,
  applyBulkCommissionController,
};
