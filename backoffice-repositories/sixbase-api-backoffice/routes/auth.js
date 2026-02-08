const router = require('express').Router();
const {
  authUser,
  authMe,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/auth');
const jwt = require('../middlewares/jwt');

router.post('/', authUser);
router.get('/me', authMe);

router.get('/profile', jwt, getProfile);
router.put('/profile', jwt, updateProfile);
router.put('/password', jwt, changePassword);

module.exports = router;
