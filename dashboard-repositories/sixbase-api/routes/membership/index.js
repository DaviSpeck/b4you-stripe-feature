const express = require('express');

const router = express.Router();
const auth = require('../../middlewares/auth_student');

router.use('/auth', require('./auth'));
router.use('/charges', auth, require('./charges'));
router.use('/lessons', auth, require('./lessons'));
router.use('/notifications', auth, require('./notifications'));
router.use('/products', auth, require('./products'));
router.use('/questions', auth, require('./questions'));
router.use('/sales', auth, require('./sales'));
router.use('/student', auth, require('./students'));
router.use('/subscriptions', auth, require('./subscriptions'));

module.exports = router;
