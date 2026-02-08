const router = require('express').Router();
const MembershipPlugins = require('../../database/models/MembershipPlugins');
const ApiError = require('../../error/ApiError');
const validateSchema = require('../../middlewares/validate-dto');
const {
  findMembershipPluginType,
} = require('../../types/membershipPluginsTypes');
const createMembershipPlugin = require('../../dto/products/createMembershipPlugin');

router.get('/', async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const plugins = await MembershipPlugins.findAll({
      raw: true,
      attributes: ['uuid', 'id_plugin', 'settings'],
      where: {
        id_product,
      },
    });
    return res.status(200).send({
      plugins: plugins.map((p) => ({
        ...p,
        type: findMembershipPluginType(p.id_plugin),
      })),
    });
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

router.post(
  '/',
  validateSchema(createMembershipPlugin),
  async (req, res, next) => {
    const {
      product: { id: id_product },
      body,
    } = req;
    try {
      const pluginType = findMembershipPluginType(body.type);
      if (!pluginType) throw ApiError.badRequest('Plugin não encontrado');
      const alreadyHasPlugin = await MembershipPlugins.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_product,
          id_plugin: pluginType.id,
        },
      });
      if (alreadyHasPlugin) {
        throw ApiError.badRequest(`Plugin ${pluginType.label} já criado`);
      }
      const plugin = await MembershipPlugins.create({
        id_product,
        id_plugin: pluginType.id,
        settings: {
          ...body.settings,
        },
      });
      return res.status(200).send(plugin);
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

router.delete('/:uuid', async (req, res, next) => {
  const {
    params: { uuid },
    product: { id: id_product },
  } = req;
  try {
    await MembershipPlugins.destroy({
      where: {
        id_product,
        uuid,
      },
    });
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
module.exports = router;
