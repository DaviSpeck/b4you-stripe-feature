const getMembershipPageLayoutByProductUseCase = require('../../useCases/membership/getMembershipPageLayoutByProduct');

const getMembershipPageLayoutByProduct = async (req, res, next) => {
  try {
    const { product_id: uuidProduct } = req.params;

    const layout = await getMembershipPageLayoutByProductUseCase({
      uuidProduct,
    });

    return res.status(200).json(layout);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMembershipPageLayoutByProduct,
};

