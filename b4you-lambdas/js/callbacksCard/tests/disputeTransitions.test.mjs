import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARGEBACK,
  CHARGEBACK_DISPUTE,
  CHARGEBACK_REVERSE,
  CHARGEBACK_WIN,
  mapChargeStatusKey,
  mapDisputeStatus,
  shouldApplyDisputeTransition,
} from '../useCases/disputeTransitions.mjs';

describe('disputeTransitions', () => {
  it('maps dispute statuses to internal states', () => {
    assert.equal(mapDisputeStatus(CHARGEBACK_DISPUTE), 'dispute_open');
    assert.equal(mapDisputeStatus(CHARGEBACK), 'dispute_lost');
    assert.equal(mapDisputeStatus(CHARGEBACK_WIN), 'dispute_won');
    assert.equal(mapDisputeStatus(CHARGEBACK_REVERSE), 'dispute_won');
  });

  it('maps charge status keys to internal states', () => {
    assert.equal(mapChargeStatusKey('chargeback_dispute'), 'dispute_open');
    assert.equal(mapChargeStatusKey('chargeback'), 'dispute_lost');
    assert.equal(mapChargeStatusKey('paid'), 'dispute_won');
  });

  it('blocks regression transitions', () => {
    const result = shouldApplyDisputeTransition('dispute_lost', 'dispute_open');
    assert.equal(result.apply, false);
    assert.equal(result.regression, true);
  });
});
