const bcrypt = require('bcryptjs');

class Encrypter {
  #encrypter;

  constructor(encrypter) {
    this.#encrypter = encrypter;
  }

  async compare(value, hash) {
    return this.#encrypter.compare(value, hash);
  }

  async hash(value) {
    const salt = await this.#encrypter.genSalt(10);
    return this.#encrypter.hash(value, salt);
  }
}

module.exports = new Encrypter(bcrypt);
