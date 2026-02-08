import express from 'express';
import {
  findAllCreators,
  getCreatorsRegisteredStats,
  getCreatorsActiveStats,
  getCreatorsAllTimeStats,
  getCreatorsNewStats,
  getCreatorsRevenueStats,
  getCreatorsConversionStats,
  getCreatorsPerformanceChart,
  getNewCreatorsPerformanceChart,
  getProducersWithCreators,
  getProductsWithCreators,
  getCreatorsKpiStats,
} from '../controllers/creators';

const router = express.Router();

router.get('/', findAllCreators);

router.get('/summary/registered', getCreatorsRegisteredStats);
router.get('/summary/active', getCreatorsActiveStats);
router.get('/summary/all-time', getCreatorsAllTimeStats);
router.get('/summary/new-creators', getCreatorsNewStats);
router.get('/summary/revenue', getCreatorsRevenueStats);
router.get('/summary/conversion', getCreatorsConversionStats);

router.get('/performance-chart', getCreatorsPerformanceChart);
router.get('/performance-chart-new', getNewCreatorsPerformanceChart);

router.get('/producers', getProducersWithCreators);
router.get('/products', getProductsWithCreators);

router.get('/kpi-stats', getCreatorsKpiStats);

export = router;