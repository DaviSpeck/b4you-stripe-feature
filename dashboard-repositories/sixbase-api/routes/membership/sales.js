const express = require('express');

const router = express.Router();
const { getStudentSales } = require('../../controllers/membership/sales');

router.get('/', getStudentSales);

module.exports = router;
