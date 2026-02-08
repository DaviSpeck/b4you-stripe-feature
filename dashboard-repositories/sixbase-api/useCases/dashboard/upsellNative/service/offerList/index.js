const { Get } = require('./get');

class OfferOptionsService {
  static async get(params) {
    const { uuid, user } = params;
    const response = await Get({ uuid, user });
    return response;
  }
}

module.exports = { OfferOptionsService };
