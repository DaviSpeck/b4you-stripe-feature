const yup = require('yup');

module.exports = yup.object().shape({
  embed: yup
    .string()
    .required()
    .test({
      name: 'test embed',
      message: `cannot contains script`,
      test: (value) =>
        (!value.includes('<script>') || !value.includes('</script>')) &&
        value.includes('<iframe') &&
        value.includes('</iframe>') &&
        value.includes('youtube.com/embed'),
    }),
});
