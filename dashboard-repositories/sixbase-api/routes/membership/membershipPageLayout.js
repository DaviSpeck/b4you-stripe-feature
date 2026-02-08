const router = require('express').Router();
const auth_student = require('../../middlewares/auth_student');
const {
  getMembershipPageLayoutByProduct,
} = require('../../controllers/membership/membershipPageLayout');

// Get membership page layout for a product (student view)
router.get(
  '/products/:uuidProduct/page-layout',
  auth_student,
  getMembershipPageLayoutByProduct
);

module.exports = router;

