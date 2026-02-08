const { findPixelType } = require('../../types/pixelsTypes');
const SerializePixel = require('./pixelCreated');

const serializePixelList = (pixels) => {
  const facebook = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('Facebook').id),
  ).adapt();
  const googleAds = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('Google Ads').id),
  ).adapt();
  const taboola = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('Taboola').id),
  ).adapt();
  const outbrain = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('Outbrain').id),
  ).adapt();
  const googleAnalytics = new SerializePixel(
    pixels.filter(
      (pixel) => pixel.id_type === findPixelType('Google Analytics').id,
    ),
  ).adapt();
  const tiktok = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('TikTok').id),
  ).adapt();
  const kwai = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('Kwai').id),
  ).adapt();
  const pinterest = new SerializePixel(
    pixels.filter((pixel) => pixel.id_type === findPixelType('Pinterest').id),
  ).adapt();
  return {
    facebook,
    googleAds,
    taboola,
    outbrain,
    googleAnalytics,
    tiktok,
    kwai,
    pinterest,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializePixelList(this.data);
  }
};
