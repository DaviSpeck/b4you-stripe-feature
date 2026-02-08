const router = require('express').Router();
const controller = require('../controllers/awardShipments');
const validate = require('../middlewares/validate-dto');
const {
  createAwardShipmentSchema,
  confirmAwardShipmentSchema,
  listAwardShipmentsSchema,
  updateAwardShipmentSchema,
} = require('../schemas/awardShipments');

router.get('/', validate(listAwardShipmentsSchema), controller.list);
router.post('/', validate(createAwardShipmentSchema), controller.create);
router.patch(
  '/:id/confirm',
  validate(confirmAwardShipmentSchema),
  controller.confirm,
);
router.patch('/:id', validate(updateAwardShipmentSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
