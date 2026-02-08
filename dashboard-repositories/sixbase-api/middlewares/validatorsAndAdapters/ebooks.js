const ApiError = require('../../error/ApiError');
const { findOneEbook } = require('../../database/controllers/product_ebooks');

const isThereAnEbook = async (req, res, next) => {
  const { ebook_id } = req.params;
  const {
    product: { id: id_product },
  } = req;

  try {
    const ebook = await findOneEbook({ id_product, uuid: ebook_id });
    if (!ebook)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Ebook não encontrado',
        }),
      );
    req.ebook = ebook;
    return next();
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
};

module.exports = {
  isThereAnEbook,
};
