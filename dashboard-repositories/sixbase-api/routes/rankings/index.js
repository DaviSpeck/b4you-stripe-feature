const express = require('express');
const auth = require('../../middlewares/auth');
const { getWeeklyRankingsController, getMonthlyRankingsController, getAllTimeRankingsController, getCustomRankingsController, getMeRankingsController } = require('../../controllers/dashboard/rankings');

const router = express.Router();

router.get('/monthly', getMonthlyRankingsController);

router.get('/weekly', getWeeklyRankingsController);

router.get('/all-time', getAllTimeRankingsController);

router.get('/custom', getCustomRankingsController);

router.use(auth);

router.get('/me', getMeRankingsController);

module.exports = router;

