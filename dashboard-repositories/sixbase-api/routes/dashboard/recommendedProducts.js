const router = require('express').Router();
const auth = require('../../middlewares/auth');
const {
  getRecommendedProducts,
  updateRecommendedProducts,
  getProducerProducts,
} = require('../../controllers/dashboard/recommendedProducts');

// Get recommended products configuration
router.get('/:uuidProduct/recommended-products', auth, getRecommendedProducts);

// Update recommended products configuration
router.put(
  '/:uuidProduct/recommended-products',
  auth,
  updateRecommendedProducts,
);

// Get available products for recommendations (producer products)
router.get(
  '/:uuidProduct/recommended-products/available',
  auth,
  getProducerProducts,
);

module.exports = router;
