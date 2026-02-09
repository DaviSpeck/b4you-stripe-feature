import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Checkout from '../Checkout';
import Checkout3Steps from '../Checkout3Steps';
import api from 'api';

jest.mock('api');

const renderWithRoute = (ui, route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>{ui}</Routes>
    </MemoryRouter>
  );

describe('international handoff (deterministic)', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    process.env.REACT_APP_INTERNATIONAL_CHECKOUT_URL =
      'https://checkout-international.test';
    api.get.mockReset();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        search: '?utm_source=e2e',
        assign: jest.fn(),
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('redirects to international checkout for standard checkout when allowed', async () => {
    api.get.mockResolvedValue({
      data: {
        product: { internacional: true },
        feature_state: 'enabled',
      },
    });

    renderWithRoute(
      <Route
        path='/:uuidOffer'
        element={<Checkout pixels={null} setPixels={jest.fn()} />}
      />,
      '/offer-123?utm_source=e2e'
    );

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        'https://checkout-international.test/international/offer-123?utm_source=e2e'
      );
    });
  });

  it('redirects to international checkout for 3 steps when allowed', async () => {
    api.get.mockResolvedValue({
      data: {
        product: { internacional: true },
        feature_state: 'enabled',
      },
    });

    renderWithRoute(
      <Route
        path='/:uuidOffer/:Checkout3Steps'
        element={<Checkout3Steps pixels={null} setPixels={jest.fn()} />}
      />,
      '/offer-123/3steps?utm_source=e2e'
    );

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith(
        'https://checkout-international.test/international/offer-123?utm_source=e2e'
      );
    });
  });

  it('shows error when product is international and flag is disabled', async () => {
    api.get.mockResolvedValue({
      data: {
        product: { internacional: true },
        feature_state: 'disabled',
      },
    });

    renderWithRoute(
      <Route
        path='/:uuidOffer'
        element={<Checkout pixels={null} setPixels={jest.fn()} />}
      />,
      '/offer-123?utm_source=e2e'
    );

    expect(
      await screen.findByText('Fluxo internacional indisponível no momento.')
    ).toBeInTheDocument();
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
