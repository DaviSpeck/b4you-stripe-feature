const router = require('express').Router();
const { banks } = require('../../utils/banks');

router.get('/', async (req, res) => res.json(banks));

module.exports = router;
