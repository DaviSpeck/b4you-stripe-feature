const router = require('express').Router();

const managersController = require('../../controllers/dashboard/managers');
const createManagerSchema = require('../../dto/managers/create');
const updateManagerSchema = require('../../dto/managers/edit');
const validateSchema = require('../../middlewares/validate-dto');

router.get('/', managersController.getManagers);

router.post(
  '/',
  validateSchema(createManagerSchema),
  managersController.createManager,
);

router.put(
  '/:id_manager',
  validateSchema(updateManagerSchema),
  managersController.updateManager,
);

router.delete('/:id_manager', managersController.deleteManager);

router.get('/find', managersController.findManager);

router.get('/count/:id_manager', managersController.getCountAffiliates);

module.exports = router;
