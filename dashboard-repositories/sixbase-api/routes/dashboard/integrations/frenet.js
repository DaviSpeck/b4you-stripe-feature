const router = require('express').Router();
const frenetController = require('../../../controllers/dashboard/integrations/frenet');

router.get('/', frenetController.list);

router.post('/', frenetController.create);

router.delete('/', frenetController.delete);

module.exports = router;
