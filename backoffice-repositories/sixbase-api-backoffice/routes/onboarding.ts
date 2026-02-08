import express from 'express';
import {
  findOnboarding,
  exportOnboarding,
  dailyCounts,
  getVersionCombinations,
} from '../controllers/onboarding';

const router = express.Router();

router.get('/', findOnboarding);

router.get('/export', exportOnboarding);

router.get('/daily', dailyCounts);

router.get('/version-combinations', getVersionCombinations);

export = router;

