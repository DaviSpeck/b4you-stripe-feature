const router = require('express').Router();
const Managers = require('../../database/models/Managers');
const Products = require('../../database/models/Products');
const ApiError = require('../../error/ApiError');
const { slugify } = require('../../utils/formatters');

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
router.get('/:manager_uuid', async (req, res, next) => {
  const { manager_uuid } = req.params;
  try {
    const manager = await Managers.findOne({
      raw: true,
      attributes: ['id', 'id_product', 'uuid'],
      where: { uuid: manager_uuid },
    });
    if (!manager) return res.sendStatus(404);
    const product = await Products.findOne({
      raw: true,
      attributes: ['uuid', 'name'],
      where: { id: manager.id_product },
    });
    res.cookie('b4youManager', manager.uuid, {
      maxAge: THIRTY_DAYS,
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      domain: '.b4you.com.br',
    });
    res.set(
      'Location',
      `https://${
        process.env.ENVIRONMENT === 'PRODUCTION' ? 'dash' : 'sandbox-dash'
      }.b4you.com.br/vitrine/produto/${slugify(product.name)}/${product.uuid}`,
    );
    return res.status(301).end();
  } catch (error) {
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

module.exports = router;
