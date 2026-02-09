require('dotenv').config();
const { generateKeyPairSync } = require('crypto');

let Token;

beforeAll(() => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  process.env.JWT_PRIVATE_KEY = privateKey
    .export({ type: 'pkcs1', format: 'pem' })
    .toString()
    .replace(/\n/g, '\\n');
  process.env.JWT_PUBLIC_KEY = publicKey
    .export({ type: 'pkcs1', format: 'pem' })
    .toString()
    .replace(/\n/g, '\\n');
  jest.resetModules();
  Token = require('../../utils/helpers/token');
});

describe('testing token', () => {
  it('should generate token', () => {
    const token = Token.generateToken({
      email: 'test@tes.com',
    });

    expect(token).toBeDefined();
  });

  it('should verify a token', () => {
    const email = 'test@test.com';
    const token = Token.generateToken({
      email,
    });

    const data = Token.verify(token);
    expect(data.email).toBe(email);
    expect(data.exp).toBeDefined();
    expect(data.iat).toBeDefined();
  });

  it('should not verify a fake token', () => {
    let error = null;
    try {
      Token.verify('124124124123');
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });
});
