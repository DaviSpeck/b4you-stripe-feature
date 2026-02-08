const descriptorSchema = require('../../dto/products/updateProductCheckout');

describe('testing yup validation', () => {
  it('should throw error when schema regex not matches on validate', async () => {
    let error = null;
    const creditcard_descriptor = 'relógio';
    try {
      await descriptorSchema.validate({
        creditcard_descriptor,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.length).toBe(1);
  });

  it('should throw error when creditcard_descriptor has more than 13 chars', async () => {
    let error = null;
    const creditcard_descriptor = 'essa palavra tem mais de 13 caracteres';
    try {
      await descriptorSchema.validate({
        creditcard_descriptor,
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.length).toBe(1);
    expect(creditcard_descriptor.length).toBeGreaterThan(13);
  });

  it('should not throw error on validate', async () => {
    let error = null;
    try {
      await descriptorSchema.validate({
        creditcard_descriptor: 'relogio',
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeNull();
  });
});
