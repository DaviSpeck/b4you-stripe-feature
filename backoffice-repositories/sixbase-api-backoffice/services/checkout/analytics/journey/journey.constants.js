const FUNNEL_STEPS = [
  { event_name: 'checkout_page_view', label: 'Visualização' },
  { event_name: 'checkout_session_started', label: 'Sessão iniciada' },
  {
    event_name: 'checkout_identification_completed',
    label: 'Identificação concluída',
  },
  { event_name: 'checkout_address_completed', label: 'Endereço concluído' },
  { event_name: 'checkout_submit_clicked', label: 'Pagamento enviado' },
  { event_name: 'checkout_conversion_success', label: 'Conversão concluída' },
];

const SUCCESS_EVENT_NAMES = [
  'checkout_conversion_success',
  'checkout_payment_success',
];

const SUMMARY_ERROR_EVENTS = [
  'checkout_identification_error',
  'checkout_address_error',
  'checkout_payment_data_error',
  'checkout_payment_error',
];

const STEP_DEFINITIONS = [
  {
    step: 'identification',
    started: [
      { event_name: 'checkout_identification_started' },
      { event_name: 'checkout_step_viewed', step: 'identification' },
    ],
    completed: [
      { event_name: 'checkout_identification_completed' },
      { event_name: 'checkout_identification_filled' },
      { event_name: 'checkout_step_advanced', step: 'address' },
    ],
    errors: [{ event_name: 'checkout_identification_error' }],
  },
  {
    step: 'address',
    started: [
      { event_name: 'checkout_address_started' },
      { event_name: 'checkout_step_viewed', step: 'address' },
    ],
    completed: [
      { event_name: 'checkout_address_completed' },
      { event_name: 'checkout_address_filled' },
      { event_name: 'checkout_step_advanced', step: 'payment' },
    ],
    errors: [{ event_name: 'checkout_address_error' }],
  },
  {
    step: 'payment',
    started: [
      { event_name: 'checkout_payment_method_selected' },
      { event_name: 'checkout_payment_data_started' },
      { event_name: 'checkout_step_viewed', step: 'payment' },
    ],
    completed: [
      { event_name: 'checkout_conversion_success' },
      { event_name: 'checkout_payment_success' },
    ],
    errors: [
      { event_name: 'checkout_payment_data_error' },
      { event_name: 'checkout_payment_error' },
    ],
  },
];

module.exports = {
  FUNNEL_STEPS,
  SUCCESS_EVENT_NAMES,
  SUMMARY_ERROR_EVENTS,
  STEP_DEFINITIONS,
};
