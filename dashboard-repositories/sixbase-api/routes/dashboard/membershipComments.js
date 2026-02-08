const express = require('express');

const router = express.Router({ mergeParams: true });
const validateDto = require('../../middlewares/validate-dto');
const updateSettingsDto = require('../../dto/products/updateMembershipCommentsSettings');
const updateCommentStatusDto = require('../../dto/products/updateMembershipCommentStatus');
const {
  deleteMembershipCommentController,
  getMembershipCommentSettingsController,
  listMembershipCommentsController,
  updateMembershipCommentSettingsController,
  updateMembershipCommentStatusController,
} = require('../../controllers/dashboard/membershipComments');

router.get('/settings', getMembershipCommentSettingsController);
router.put(
  '/settings',
  validateDto(updateSettingsDto),
  updateMembershipCommentSettingsController,
);

router.get('/', listMembershipCommentsController);

router.patch(
  '/:comment_id/status',
  validateDto(updateCommentStatusDto),
  updateMembershipCommentStatusController,
);

router.delete('/:comment_id', deleteMembershipCommentController);

module.exports = router;

