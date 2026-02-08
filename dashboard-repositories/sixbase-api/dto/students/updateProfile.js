const yup = require('yup');
const { validateAndFormatDocument } = require('../../utils/validations');

module.exports = yup.object().shape({
  biography: yup.string(),
  full_name: yup.string(),
  whatsapp: yup.string(),
  document_number: yup.string().test({
    name: 'Validate Document',
    message: 'Invalid document',
    test: (document_number) => {
      if (document_number) {
        try {
          validateAndFormatDocument(document_number);
          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    },
  }),
});
