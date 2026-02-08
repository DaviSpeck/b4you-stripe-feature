const uuid = require('../../utils/helpers/uuid');

describe('testing uuid', () => {
  it('should generate uuid v4', () => {
    const data = uuid.v4();
    expect(data).toBeDefined();
    expect(typeof data).toBe('string');
  });

  it('should generate nanoid length 21', () => {
    const data = uuid.nanoid();
    expect(data).toBeDefined();
    expect(typeof data).toBe('string');
    expect(data.length).toBe(21);
  });

  it('should generate nanoid length 10', () => {
    const data = uuid.nanoid(10);
    expect(data).toBeDefined();
    expect(typeof data).toBe('string');
    expect(data.length).toBe(10);
  });

  it('should validate uuid v4', () => {
    const data = uuid.v4();
    const verify = uuid.validate(data);
    expect(verify).toBe(true);
  });

  it('should not validate uuid v4', () => {
    const data = '12312312';
    const verify = uuid.validate(data);
    expect(verify).toBe(false);
  });
});
