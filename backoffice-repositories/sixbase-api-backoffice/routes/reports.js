const router = require('express').Router();
const ReportsController = require('../controllers/reports');

router.get('/costs', ReportsController.getCosts);

router.get('/', ReportsController.getMetrics);

router.put('/card', ReportsController.changeCardCost);

module.exports = router;
