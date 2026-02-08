function upsellSerealizer(data) {
  const booleanFields = [
    'is_one_click',
    'is_embed_video',
    'is_message_not_close',
    'is_multi_offer',
    'is_step_visible',
    'is_header_visible',
    'is_footer_visible',
  ];

  const resSerealizer = {};

  Object.entries(data).forEach(([key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    resSerealizer[camelKey] = booleanFields.includes(key)
      ? Boolean(value)
      : value;
  });

  return resSerealizer;
}

module.exports = { upsellSerealizer };
