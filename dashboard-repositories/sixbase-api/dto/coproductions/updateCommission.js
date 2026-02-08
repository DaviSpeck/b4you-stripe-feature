const yup = require('yup');
const {
  MAXCOMMISSION,
} = require('../../useCases/dashboard/coproductions/common');

module.exports = yup.object().shape({
  commission: yup.number().min(0.1).max(MAXCOMMISSION).required(),
});
