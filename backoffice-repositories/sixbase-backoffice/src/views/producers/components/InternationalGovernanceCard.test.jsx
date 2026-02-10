import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import InternationalGovernanceCard from './InternationalGovernanceCard';

jest.mock('../../../services/api', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { api } = require('../../../services/api');


describe('InternationalGovernanceCard', () => {
  let container;

  beforeEach(() => {
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('loads governance and persists update via PATCH', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        international_status: 'blocked',
        international_stripe_enabled: false,
        international_rules: { region: 'US' },
        international_status_updated_at: '2026-02-10T00:00:00.000Z',
        international_status_updated_by: 9001,
      },
    });

    api.patch.mockResolvedValueOnce({ status: 200 });
    api.get.mockResolvedValueOnce({
      data: {
        international_status: 'enabled',
        international_stripe_enabled: true,
        international_rules: { region: 'US' },
      },
    });

    await act(async () => {
      ReactDOM.render(
        <InternationalGovernanceCard userUuid="producer-uuid" />,
        container,
      );
    });

    const reasonInput = container.querySelector('input[aria-label="Motivo"]');
    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent.includes('Salvar governança'),
    );


    await act(async () => {
      Simulate.change(reasonInput, { target: { value: 'Aprovação manual' } });
    });

    await act(async () => {
      Simulate.click(saveButton);
    });

    expect(api.patch).toHaveBeenCalledWith(
      '/users/producer-uuid/international-governance',
      expect.objectContaining({
        status: 'blocked',
        international_stripe_enabled: false,
        reason: 'Aprovação manual',
      }),
    );

    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
