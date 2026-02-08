const yup = require('yup');

module.exports = yup.object().shape({
  first_name: yup.string().nullable(),
  last_name: yup.string().nullable(),
  occupation: yup.string().nullable(),
  whatsapp: yup.string().nullable(),
  instagram: yup.string().nullable(),
  birth_date: yup.date().nullable(),
});
