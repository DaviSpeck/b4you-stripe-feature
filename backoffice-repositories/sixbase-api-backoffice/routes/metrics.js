const express = require('express');

const router = express.Router();
const metricsController = require('../controllers/metrics');

router.get('/', metricsController.findMetrics);

router.get('/average-ticket', metricsController.averageTicket);

router.get('/average-sales', metricsController.averageSales);

router.get('/average-refunds', metricsController.averageRefunds);

router.get('/average-ranking', metricsController.averageRanking);

router.get('/average-product', metricsController.averageProducts);

router.get('/average-producer', metricsController.averageProducer);

router.get(
  '/average-general-producer',
  metricsController.averageGeneralProducers,
);

router.get('/average-amount', metricsController.averageAmount);
router.get('/average-amount/range', metricsController.averageAmountRange);

router.get('/rewards', metricsController.rewards);

router.get('/ticket', metricsController.ticket);
router.get('/fees', metricsController.fees);

router.get('/denieds', metricsController.denieds);

// ---------------------- Painel 1 (Overview de Produtos) ----------------------

router.get('/active', metricsController.getActiveProducts)
router.get('/new', metricsController.getNewProducts)
router.get('/ranking', metricsController.getProductRanking)

// ---------------------- Painel 2 (Análise de Produtores) ----------------------

router.get('/producers/paused', metricsController.getPausedProducers)
router.get('/producers/comparative', metricsController.getTopProducersComparison)
router.get('/producers/intervals', metricsController.getProducerIntervals)
router.get('/producers/performance-drop', metricsController.getProducerPerformanceDrop)

module.exports = router;
