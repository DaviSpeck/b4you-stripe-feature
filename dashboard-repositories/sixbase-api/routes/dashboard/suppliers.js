const router = require('express').Router();

const validateDTO = require('../../middlewares/validate-dto');
const createSupplierSchema = require('../../dto/suppliers/create');
const updateSupplierSchema = require('../../dto/suppliers/edit');

const suppliersController = require('../../controllers/dashboard/suppliers');

router.get('/', suppliersController.getSuppliers);

router.post(
  '/',
  validateDTO(createSupplierSchema),
  suppliersController.createSupplier,
);

router.put(
  '/:id_supplier',
  validateDTO(updateSupplierSchema),
  suppliersController.updateSupplier,
);

router.delete('/:id_supplier', suppliersController.deleteSupplier);

router.get('/find', suppliersController.findUserSupplier);

router.get('/default', suppliersController.getSupplierProductDefault);

router.post(
  '/default',
  validateDTO(createSupplierSchema),
  suppliersController.createSupplierProductDefault,
);

router.put(
  '/default/:id_supplier',
  validateDTO(updateSupplierSchema),
  suppliersController.updateSupplierProductDefault,
);

router.delete(
  '/default/:id_supplier',
  suppliersController.deleteSupplierProductDefault,
);

module.exports = router;
