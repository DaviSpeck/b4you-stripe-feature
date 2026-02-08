const { validateCPF } = require('../../utils/validations');

const makeSut = () => {
  const sut = validateCPF;
  return {
    sut,
  };
};

it('should return false when invalid cpf', () => {
  const { sut } = makeSut();
  const invalidCpf = sut('invalid cpf');
  expect(invalidCpf).toBe(false);
});

it('should return false when invalid length', () => {
  const { sut } = makeSut();
  const invalidCpf = sut('0000000000000000');
  expect(invalidCpf).toBe(false);
});

it('should return false when no cpf is provided', () => {
  const { sut } = makeSut();
  const invalidCpf = sut();
  expect(invalidCpf).toBe(false);
});

it('should return true when valid cpf is passed without dots', () => {
  const { sut } = makeSut();
  const validCpf = sut('93617089020');
  expect(validCpf).toBe(true);
});

it('should return true when valid cpf with dots is passed', () => {
  const { sut } = makeSut();
  const validCpf = sut('730.882.260-53');
  expect(validCpf).toBe(true);
});
