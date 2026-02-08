
const router = require('express').Router();
const tinyController = require('../../../controllers/dashboard/integrations/tiny');

router.get('/', tinyController.list);

router.post('/', tinyController.create);

router.delete('/', tinyController.delete);

module.exports = router;