const getRecommendedProductsWithAccessUseCase = require('../../useCases/membership/getRecommendedProductsWithAccess');

const getRecommendedProductsWithAccess = async (req, res, next) => {
  try {
    const uuidProduct = req.params.product_id;
    const { id: idStudent } = req.student;

    const result = await getRecommendedProductsWithAccessUseCase({
      uuidProduct,
      idStudent,
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getRecommendedProductsWithAccess,
};
