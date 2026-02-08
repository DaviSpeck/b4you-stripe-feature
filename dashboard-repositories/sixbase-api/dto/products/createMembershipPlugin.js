const yup = require('yup');
const {
  membershipPluginsTypes,
} = require('../../types/membershipPluginsTypes');

module.exports = yup.object().shape({
  type: yup.string().oneOf(membershipPluginsTypes.map(({ key }) => key)),
  settings: yup.object().when('type', {
    is: 'whatsapp',
    then: yup.object().shape({
      phone: yup.string().required(),
      message: yup.string().nullable(),
    }),
    otherwise: yup.object().shape({
      token: yup.string().required(),
    }),
  }),
});
