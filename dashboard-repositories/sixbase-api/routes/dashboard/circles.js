const express = require('express');

const router = express.Router();

const CircleController = require('../../controllers/dashboard/integrations/circles');

router.get('/', CircleController.get);
router.post('/', CircleController.create);
router.delete('/', CircleController.delete);

module.exports = router;
