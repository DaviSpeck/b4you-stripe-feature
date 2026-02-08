const router = require('express').Router();
const {
  getVerifications,
  getCNPJVerifications,
  approveCPFKyc,
  reproveCPFKyc,
  approveCNPJKyc,
  reproveCNPJKyc,
  getKycFile,
  getInfo,
} = require('../controllers/kyc');

router.get('/', getVerifications);
router.get('/info/:id_user', getInfo);
router.get('/cnpj', getCNPJVerifications);
router.get('/file/:key', getKycFile);
router.post('/cpf/approve', approveCPFKyc);
router.post('/cpf/reprove', reproveCPFKyc);
router.post('/cnpj/approve', approveCNPJKyc);
router.post('/cnpj/reprove', reproveCNPJKyc);

module.exports = router;
