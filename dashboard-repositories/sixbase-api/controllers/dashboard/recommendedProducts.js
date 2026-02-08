const getProducerProductsUseCase = require('../../useCases/dashboard/getProducerProducts');
const getRecommendedProductsUseCase = require('../../useCases/dashboard/getRecommendedProducts');
const updateRecommendedProductsUseCase = require('../../useCases/dashboard/updateRecommendedProducts');

const getProducerProducts = async (req, res, next) => {
  try {
    const { uuidProduct } = req.params;
    const { id: idUser } = req.user;

    const products = await getProducerProductsUseCase({
      uuidProduct,
      idUser,
    });

    return res.status(200).json(products);
  } catch (err) {
    return next(err);
  }
};

const getRecommendedProducts = async (req, res, next) => {
  try {
    const { uuidProduct } = req.params;
    const { id: idUser } = req.user;

    const config = await getRecommendedProductsUseCase({
      uuidProduct,
      idUser,
    });

    return res.status(200).json(config);
  } catch (err) {
    return next(err);
  }
};

const updateRecommendedProducts = async (req, res, next) => {
  try {
    const { uuidProduct } = req.params;
    const { id: idUser } = req.user;
    const { enabled, layout, recommendedProducts } = req.body;

    const config = await updateRecommendedProductsUseCase({
      uuidProduct,
      idUser,
      enabled,
      layout,
      recommendedProducts,
    });

    return res.status(200).json(config);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getProducerProducts,
  getRecommendedProducts,
  updateRecommendedProducts,
};
