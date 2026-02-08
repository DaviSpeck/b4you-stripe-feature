import { useCallback, useEffect, useRef } from 'react';
import { trackCheckoutEvent } from './eventManager';

export const useCheckoutTracking = ({ offerId, checkoutType }) => {
  const initializedRef = useRef(false);
  const trackEvent = useCallback(
    (eventName, details = {}) => {
      trackCheckoutEvent({
        eventName,
        offerId,
        checkoutType,
        ...details,
      });
    },
    [offerId, checkoutType]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    if (!offerId || !checkoutType) return;
    trackCheckoutEvent({
      eventName: 'checkout_page_view',
      offerId,
      checkoutType,
    });
    trackCheckoutEvent({
      eventName: 'checkout_session_started',
      offerId,
      checkoutType,
    });
    initializedRef.current = true;
  }, [offerId, checkoutType]);

  return { trackEvent };
};
