/* eslint-disable no-useless-escape */
module.exports.URL =
  '^((http|https)://)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(.[a-zA-Z]+)+(/)?.([w?[a-zA-Z-_%/@?]+)*([^/w?[a-zA-Z0-9_-]+=w+(&[a-zA-Z0-9_]+=w+)*)?$';

module.exports.CREDIT_CARD_DESCRIPTION = '^[\\sa-zA-Z0-9]{0,13}$';

module.exports.EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports.PHONE =
  /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})-?(\d{4}))$/;

module.exports.DOCUMENT = /[+\d-.]{11,14}$/;

module.exports.ONLY_DIGITS = /^\d+$/;

module.exports.YOUTUBE_URL =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

module.exports.VIMEO_URL =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:vimeo\.com))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

module.exports.EMBED_URL =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$|^((?:https?:)?\/\/)?((?:www|m)\.)?((?:vimeo\.com))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

module.exports.COUPONS = /^[A-Za-z-0-9]*$/;

module.exports.GOOGLE_ADS = /(AW-)[\d]{7,}/;
