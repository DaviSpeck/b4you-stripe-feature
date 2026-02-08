const router = require('express').Router();
const auth = require('../../middlewares/auth');
const {
  getMembershipPageLayout,
  updateMembershipPageLayout,
  resetMembershipPageLayout,
} = require('../../controllers/dashboard/membershipPageLayout');
const validateDto = require('../../middlewares/validate-dto');
const updateMembershipPageLayoutDto = require('../../dto/products/updateMembershipPageLayout');

// Get membership page layout
router.get(
  '/:uuidProduct/membership-page-layout',
  auth,
  getMembershipPageLayout
);

// Update membership page layout
router.put(
  '/:uuidProduct/membership-page-layout',
  auth,
  validateDto(updateMembershipPageLayoutDto),
  updateMembershipPageLayout
);

// Reset membership page layout to default
router.post(
  '/:uuidProduct/membership-page-layout/reset',
  auth,
  resetMembershipPageLayout
);

module.exports = router;

