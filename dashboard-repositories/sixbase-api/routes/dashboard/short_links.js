const express = require("express");

const router = express.Router();

const auth = require("../../middlewares/auth");
const collaborationPermission = require("../../middlewares/permissions");
const collaboratorsActivity = require("../../middlewares/collaboratorsActivity");

const ShortLinksController = require("../../controllers/dashboard/short_links");

router.post(
    "/",
    auth,
    collaborationPermission("market"),
    collaboratorsActivity,
    ShortLinksController.create
);

module.exports = router;