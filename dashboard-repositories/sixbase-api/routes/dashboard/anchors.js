const router = require('express').Router();
const AnchorsController = require('../../controllers/dashboard/anchors');
const validateSchema = require('../../middlewares/validate-dto');
const createSchema = require('../../dto/anchors/create');

router.post('/', validateSchema(createSchema), AnchorsController.create);

router.put('/reorder', AnchorsController.reorder);

router.put('/anchor-view', AnchorsController.updateAnchorView);

router.get('/anchor-view', AnchorsController.getAnchorView);

router.put(
  '/:anchorUuid',
  validateSchema(createSchema),
  AnchorsController.update,
);

router.get('/', AnchorsController.get);

router.get('/modules', AnchorsController.getModules);

router.delete('/:anchorUuid', AnchorsController.delete);

router.put('/:anchorUuid/change-anchor', AnchorsController.reorderModules);

router.put('/:anchorUuid/reorder-modules', AnchorsController.reorderModules);

router.post('/:anchorUuid/:moduleUuid', AnchorsController.link);

router.put('/:anchorUuid/:moduleUuid', AnchorsController.unlink);

module.exports = router;
