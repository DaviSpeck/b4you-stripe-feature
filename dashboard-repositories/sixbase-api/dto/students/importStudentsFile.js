const yup = require('yup');

module.exports = yup.object().shape({
  data: yup
    .array()
    .of(
      yup.object().shape({
        full_name: yup.string(),
        email: yup.string().email(),
        whatsapp: yup.string(),
        document_number: yup.string(),
      }),
    )
    .required(),
  classroom_id: yup.string().nullable(),
});
