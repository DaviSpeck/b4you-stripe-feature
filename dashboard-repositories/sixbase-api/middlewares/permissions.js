const ApiError = require('../error/ApiError');

const collaborationPermission = (routeName) => async (req, res, next) => {
  const {
    user: { permissions },
  } = req.session;
  try {
    if (Array.isArray(routeName)) {
      for (const route of routeName) {
        if (permissions[route]) {
          return next();
        }
      }
    }
    if (!permissions[routeName])
      throw ApiError.forbidden('Acesso não permitido');
    return next();
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return res.status(403).send({
      success: false,
      message: 'Acesso não permitido',
    });
  }
};

module.exports = collaborationPermission;
