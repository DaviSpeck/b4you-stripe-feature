export const CHARGEBACK = 6;
export const CHARGEBACK_DISPUTE = 7;
export const CHARGEBACK_WIN = 1;
export const CHARGEBACK_REVERSE = 8;

const DISPUTE_FLOW = ['dispute_open', 'dispute_won', 'dispute_lost'];

export const mapDisputeStatus = status => {
  if (status === CHARGEBACK_DISPUTE) return 'dispute_open';
  if (status === CHARGEBACK) return 'dispute_lost';
  if (status === CHARGEBACK_WIN || status === CHARGEBACK_REVERSE) return 'dispute_won';
  return null;
};

export const mapChargeStatusKey = key => {
  if (key === 'chargeback_dispute') return 'dispute_open';
  if (key === 'chargeback') return 'dispute_lost';
  if (key === 'paid') return 'dispute_won';
  return null;
};

export const shouldApplyDisputeTransition = (currentState, nextState) => {
  if (!nextState) return { apply: false, regression: false };
  if (!currentState) return { apply: true, regression: false };
  const currentRank = DISPUTE_FLOW.indexOf(currentState);
  const nextRank = DISPUTE_FLOW.indexOf(nextState);
  if (currentRank === -1 || nextRank === -1) {
    return { apply: true, regression: false };
  }
  if (nextRank < currentRank) return { apply: false, regression: true };
  if (nextRank === currentRank) return { apply: false, regression: false };
  return { apply: true, regression: false };
};
