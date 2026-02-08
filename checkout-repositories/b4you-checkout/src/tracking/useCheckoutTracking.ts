import { useCallback, useEffect, useRef } from "react";
import {
  getSessionId,
  setCheckoutTypeOnce,
  trackCheckoutEvent,
} from "./eventManager";
import { CheckoutEventName, CheckoutEventPayload, CheckoutType } from "./eventTypes";

type TrackEventDetails = Partial<
  Pick<CheckoutEventPayload, "step" | "email" | "phone" | "paymentMethod">
>;

type UseCheckoutTrackingOptions = {
  offerId?: string;
  checkoutType?: CheckoutType;
  autoTrackPageView?: boolean;
  autoTrackSessionStart?: boolean;
};

export function useCheckoutTracking({
  offerId,
  checkoutType,
  autoTrackPageView = true,
  autoTrackSessionStart = true,
}: UseCheckoutTrackingOptions) {
  const offerIdFromPath =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean)[0]
      : undefined;
  const effectiveOfferId = offerIdFromPath ?? offerId;

  if (checkoutType) {
    setCheckoutTypeOnce(checkoutType);
  }

  const offerIdRef = useRef(effectiveOfferId);
  const pageViewTracked = useRef(false);
  const sessionStartTracked = useRef(false);

  useEffect(() => {
    offerIdRef.current = effectiveOfferId;
  }, [effectiveOfferId]);

  useEffect(() => {
    if (!autoTrackSessionStart || !effectiveOfferId) return;

    const session = getSessionId();

    if (!session || !session.isNew || sessionStartTracked.current) return;

    trackCheckoutEvent({
      eventName: "checkout_session_started",
      offerId: effectiveOfferId,
    });

    sessionStartTracked.current = true;
  }, [effectiveOfferId, autoTrackSessionStart]);

  useEffect(() => {
    if (!autoTrackPageView || !effectiveOfferId) return;

    if (pageViewTracked.current) return;

    trackCheckoutEvent({
      eventName: "checkout_page_view",
      offerId: effectiveOfferId,
    });

    pageViewTracked.current = true;
  }, [effectiveOfferId, autoTrackPageView]);

  const trackEvent = useCallback(
    (eventName: CheckoutEventName, details: TrackEventDetails = {}) => {
      const currentOfferId = offerIdRef.current;

      if (!currentOfferId) return;

      trackCheckoutEvent({
        eventName,
        offerId: currentOfferId,
        details,
      });
    },
    [],
  );

  return { trackEvent };
}