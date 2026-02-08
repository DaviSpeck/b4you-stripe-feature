const router = require('express').Router();
const BlacklistController = require('../controllers/blacklist');

router.get('/', BlacklistController.findBlacklist);

router.get('/sales', BlacklistController.getSales);

router.get('/old/sales', BlacklistController.getOldSales);

router.put('/active', BlacklistController.setBlacklist);

router.put('/action', BlacklistController.setAction);

router.put('/register', BlacklistController.register);

router.get('/blocks', BlacklistController.getBlocks);

router.delete('/blocks', BlacklistController.removeBlock);

router.post('/score', BlacklistController.score);

module.exports = router;
