const REQUESTED_KEYS = new Set([
  'requested-by-student',
  'requested-by-producer',
  'refund-warranty',
]);

const REFUND_FLOW = ['refund_requested', 'refund_succeeded', 'refund_failed'];

const mapRefundStatusKey = (key) => {
  if (!key) return null;
  if (REQUESTED_KEYS.has(key)) return 'refund_requested';
  if (key === 'paid') return 'refund_succeeded';
  if (key === 'denied' || key === 'refund-warranty-canceled') return 'refund_failed';
  return null;
};

const mapCallbackStatus = (status) => {
  if (status === 1) return 'refund_succeeded';
  if (status === 2) return 'refund_failed';
  return null;
};

const shouldApplyRefundTransition = (currentState, nextState) => {
  if (!nextState) return { apply: false, regression: false };
  if (!currentState) return { apply: true, regression: false };
  const currentRank = REFUND_FLOW.indexOf(currentState);
  const nextRank = REFUND_FLOW.indexOf(nextState);
  if (currentRank === -1 || nextRank === -1) {
    return { apply: true, regression: false };
  }
  if (nextRank < currentRank) return { apply: false, regression: true };
  if (nextRank === currentRank) return { apply: false, regression: false };
  return { apply: true, regression: false };
};

module.exports = {
  mapRefundStatusKey,
  mapCallbackStatus,
  shouldApplyRefundTransition,
};
