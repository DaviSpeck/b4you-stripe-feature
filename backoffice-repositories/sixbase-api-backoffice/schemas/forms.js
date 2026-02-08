const yup = require('yup');

const questionTypes = [
  'text',
  'textarea',
  'select',
  'multiselect',
  'boolean',
  'date',
  'number',
];
const { formTypes } = require('../types/forms');
const formTypeIds = formTypes.map((t) => t.id);

const visibleIfSchema = yup
  .mixed()
  .test('is-valid-visible-if', 'visible_if inválido', (value) => {
    if (value === undefined) return true;
    try {
      JSON.stringify(value);
      return true;
    } catch (_) {
      return false;
    }
  });

exports.listFormsSchema = yup
  .object({
    form_type: yup.number().integer().oneOf(formTypeIds).notRequired(),
    is_active: yup.boolean().notRequired(),
    page: yup.number().integer().min(0).default(0),
    size: yup.number().integer().min(1).max(100).default(20),
  })
  .required();

exports.createFormSchema = yup
  .object({
    form_type: yup.number().integer().oneOf(formTypeIds).required(),
    title: yup.string().max(200).required(),
  })
  .required();

exports.updateFormSchema = yup
  .object({
    form_type: yup.number().integer().oneOf(formTypeIds).notRequired(),
    title: yup.string().max(200).notRequired(),
    is_active: yup.boolean().notRequired(),
  })
  .required();

exports.createQuestionSchema = yup
  .object({
    key: yup.string().max(150).required(),
    label: yup.string().max(500).required(),
    type: yup.string().oneOf(questionTypes).required(),
    options: yup.mixed().when('type', {
      is: (t) => t === 'select' || t === 'multiselect',
      then: (s) => s.required(),
      otherwise: (s) => s.notRequired(),
    }),
    required: yup.boolean().default(false),
    order: yup.number().integer().min(0).notRequired(),
    visible_if: visibleIfSchema,
    is_active: yup.boolean().default(true),
    help_text: yup.string().max(500).notRequired(),
    placeholder: yup.string().max(200).notRequired(),
  })
  .required();

exports.updateQuestionSchema = yup
  .object({
    label: yup.string().max(500).notRequired(),
    type: yup.string().oneOf(questionTypes).notRequired(),
    options: yup.mixed().when('type', {
      is: (t) => t === 'select' || t === 'multiselect',
      then: (s) => s.required(),
      otherwise: (s) => s.notRequired(),
    }),
    required: yup.boolean().notRequired(),
    order: yup.number().integer().min(0).notRequired(),
    visible_if: visibleIfSchema,
    is_active: yup.boolean().notRequired(),
    help_text: yup.string().max(500).notRequired(),
    placeholder: yup.string().max(200).notRequired(),
  })
  .required();

exports.reorderQuestionsSchema = yup
  .object({
    orders: yup
      .array()
      .of(
        yup.object({
          questionId: yup.number().integer().required(),
          order: yup.number().integer().min(0).required(),
        }),
      )
      .min(1)
      .required(),
  })
  .required();

exports.publishFormSchema = yup.object({}).required();
