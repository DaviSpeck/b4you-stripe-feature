const yup = require('yup');

const milestoneEnum = ['10K', '50K', '500K', '1M', '5M', '10M'];

exports.createAwardShipmentSchema = yup
  .object({
    producer_id: yup.number().integer().notRequired(),
    producer_uuid: yup.string().uuid().notRequired(),
    producer_email: yup.string().email().notRequired(),
    milestone: yup.string().oneOf(milestoneEnum).required(),
    achieved_date: yup.date().required(),
    tracking_code: yup.string().max(100).notRequired(),
    tracking_link: yup
      .string()
      .transform((value, originalValue) => {
        const v = (originalValue || '').trim();
        return v === '-' || v === '' ? undefined : originalValue;
      })
      .url()
      .max(300)
      .notRequired(),
    status: yup.string().oneOf(['pending', 'sent']).notRequired(),
    sent_date: yup.date().notRequired(),
  })
  .required();

exports.confirmAwardShipmentSchema = yup
  .object({
    id: yup.number().integer().notRequired(),
    tracking_code: yup.string().max(100).notRequired(),
    tracking_link: yup
      .string()
      .transform((value, originalValue) => {
        const v = (originalValue || '').trim();
        return v === '-' || v === '' ? undefined : originalValue;
      })
      .url()
      .max(300)
      .notRequired(),
    sent_date: yup.date().notRequired(),
  })
  .required();

exports.updateAwardShipmentSchema = yup
  .object({
    producer_id: yup.number().integer().notRequired(),
    milestone: yup.string().oneOf(milestoneEnum).notRequired(),
    achieved_date: yup.date().notRequired(),
    tracking_code: yup.string().max(100).notRequired(),
    tracking_link: yup
      .string()
      .transform((value, originalValue) => {
        const v = (originalValue || '').trim();
        return v === '-' || v === '' ? undefined : originalValue;
      })
      .url()
      .max(300)
      .notRequired(),
    status: yup.string().oneOf(['pending', 'sent']).notRequired(),
    sent_date: yup.date().notRequired(),
  })
  .required();

exports.listAwardShipmentsSchema = yup
  .object({
    producer_id: yup.number().integer().notRequired(),
    producer_uuid: yup.string().uuid().notRequired(),
    milestone: yup.string().oneOf(milestoneEnum).notRequired(),
    status: yup.string().oneOf(['pending', 'sent']).notRequired(),
    input: yup.string().notRequired(),
    page: yup.number().integer().min(0).default(0),
    size: yup.number().integer().min(1).max(100).default(20),
  })
  .required();
