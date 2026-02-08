const router = require('express').Router();
const ProductPages = require('../../database/models/ProductPages');
const ApiError = require('../../error/ApiError');
const {
  findProductPageTypeByID,
  findProductPageTypeByKey,
} = require('../../types/productPagesTypes');
const { capitalizeName } = require('../../utils/formatters');
const createPage = require('../../dto/pages/createPage');
const updatePage = require('../../dto/pages/updatePage');
const validateSchema = require('../../middlewares/validate-dto');

const serializeProductPage = ({ uuid, label, url, id_type }) => ({
  uuid,
  label: capitalizeName(label),
  url,
  type: findProductPageTypeByID(id_type),
});

router.post('/', validateSchema(createPage), async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { label, url, type },
  } = req;

  try {
    const pageType = findProductPageTypeByKey(type);
    if (!pageType) throw ApiError.badRequest('Invalid type');
    const page = await ProductPages.create({
      label: label.toLowerCase(),
      id_product,
      url,
      id_type: pageType.id,
    });
    return res.status(200).send(serializeProductPage(page));
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

router.delete('/:uuid_page', async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { uuid_page },
  } = req;
  try {
    await ProductPages.destroy({ where: { id_product, uuid: uuid_page } });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

router.get('/', async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const pages = await ProductPages.findAll({
      raw: true,
      where: {
        id_product,
      },
    });

    return res.status(200).send(pages.map((p) => serializeProductPage(p)));
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

router.put(
  '/:page_uuid',
  validateSchema(updatePage),
  async (req, res, next) => {
    const {
      body,
      params: { page_uuid },
      product: { id: id_product },
    } = req;
    try {
      if (Object.keys(body).length === 0)
        throw ApiError.badRequest('Necessário enviar as informações da página');

      if (body.type) {
        body.id_type = findProductPageTypeByKey(body.type).id;
      }

      await ProductPages.update(body, {
        where: {
          id_product,
          uuid: page_uuid,
        },
      });

      const page = await ProductPages.findOne({
        raw: true,
        where: {
          id_product,
          uuid: page_uuid,
        },
      });

      return res.status(200).send(serializeProductPage(page));
    } catch (error) {
      if (error instanceof ApiError) return res.status(error.code).send(error);
      return next(
        ApiError.internalServerError(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
          error,
        ),
      );
    }
  },
);

module.exports = router;
