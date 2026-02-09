const {
  mapCallbackStatus,
  mapRefundStatusKey,
  shouldApplyRefundTransition,
} = require('../../useCases/callbacks/refundTransitions');

describe('refundTransitions', () => {
  it('maps refund status keys to internal states', () => {
    expect(mapRefundStatusKey('requested-by-student')).toBe('refund_requested');
    expect(mapRefundStatusKey('requested-by-producer')).toBe('refund_requested');
    expect(mapRefundStatusKey('refund-warranty')).toBe('refund_requested');
    expect(mapRefundStatusKey('paid')).toBe('refund_succeeded');
    expect(mapRefundStatusKey('denied')).toBe('refund_failed');
  });

  it('maps callback status to internal states', () => {
    expect(mapCallbackStatus(1)).toBe('refund_succeeded');
    expect(mapCallbackStatus(2)).toBe('refund_failed');
  });

  it('blocks regression transitions', () => {
    const result = shouldApplyRefundTransition(
      'refund_succeeded',
      'refund_requested',
    );
    expect(result.apply).toBe(false);
    expect(result.regression).toBe(true);
  });
});
