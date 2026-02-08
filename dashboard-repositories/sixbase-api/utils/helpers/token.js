const jwt = require('jsonwebtoken');

class Token {
  #tokenizer;

  #publicKey;

  #privateKey;

  #config;

  constructor(tokenizer, privateKey, publicKey, config) {
    this.#tokenizer = tokenizer;
    this.#privateKey = privateKey;
    this.#publicKey = publicKey;
    this.#config = config;
  }

  verify(token) {
    const data = this.#tokenizer.verify(token, this.#publicKey);
    return data;
  }

  generateToken(data, expiresIn = 60 * 60 * 24) {
    const token = this.#tokenizer.sign(data, this.#privateKey, {
      ...this.#config,
      expiresIn,
    });
    return token;
  }
}

const privateKey = process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');

module.exports = new Token(jwt, privateKey, publicKey, {
  algorithm: 'RS256',
  expiresIn: 60 * 60 * 24,
});