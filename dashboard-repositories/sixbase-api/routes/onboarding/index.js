const router = require('express').Router();
const controller = require('../../controllers/onboarding/onboarding');

router.get('/form/:user_type', controller.getActiveForm);
router.post('/answers', controller.submitAnswers);

module.exports = router;
