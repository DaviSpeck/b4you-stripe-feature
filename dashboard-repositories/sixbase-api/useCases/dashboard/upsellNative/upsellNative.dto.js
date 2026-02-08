function upsellNativeDto(data) {
  const resDto = {};

  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    resDto[snakeKey] = value;
  });

  return resDto;
}

module.exports = { upsellNativeDto };
