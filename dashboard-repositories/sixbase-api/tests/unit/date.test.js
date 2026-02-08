const date = require('../../utils/helpers/date');

describe('testing date module', () => {
  it('should diff dates', () => {
    const diff = date(new Date('2022-09-10')).diff(date(), 'd');
    expect(diff).toBeLessThan(0);
  });

  it('should diff equal dates', () => {
    const requestedRefundDate = date();
    const validRefundUntil = date();
    const diff = date(requestedRefundDate).diff(date(validRefundUntil), 'd');
    expect(diff).toBe(0);
  });

  it('should diff valid refund', () => {
    const requestedRefundDate = date().now();
    const validRefundUntil = date().add(1, 'd');
    const diff = date(requestedRefundDate).diff(validRefundUntil, 'd');
    expect(diff).toBe(-1);
  });
});
