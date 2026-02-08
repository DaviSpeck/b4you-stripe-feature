const express = require('express');

const router = express.Router();

const {
  filtersInvoiceController,
  findInvoicesPaginatedController,
  printReceiptPDFController,
  exportXLSConstroller,
} = require('../../controllers/dashboard/invoices');

router.get('/', findInvoicesPaginatedController);

router.get('/filters', filtersInvoiceController);

router.get('/:invoice_id/print', printReceiptPDFController);

router.get('/xls', exportXLSConstroller);

module.exports = router;
