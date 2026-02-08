const ApiError = require('../../error/ApiError');
const { findOnePixel } = require('../../database/controllers/pixels');
const { findPixelType } = require('../../types/pixelsTypes');

const validateGoogleAnalytics = async (req, res, next) => {
  const {
    product: { id: id_product },
    user: { id: id_user },
  } = req;
  try {
    const pixelGoogleAnalytics = await findOnePixel({
      id_product,
      id_user,
      id_type: findPixelType('Google Analytics').id,
    });
    if (pixelGoogleAnalytics)
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'Este usuário já possui uma integração de pixel do Google Analytics com este produto',
        }),
      );
    return next();
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

module.exports = { validateGoogleAnalytics };
