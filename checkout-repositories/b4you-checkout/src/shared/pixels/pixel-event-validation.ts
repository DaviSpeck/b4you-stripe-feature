import Cookies from "js-cookie";
import { PaymentTypes } from "@/interfaces/offer";
import { PixelEventType } from "@/interfaces/pixel";

type ParamsType = {
  event: Exclude<PixelEventType, "payment">;
  offerId?: string;
  paymentMethod?: PaymentTypes;
};

type ResposeType = boolean;

export function eventPixelEventValidation(params: ParamsType): ResposeType {
  const { event, offerId } = params;

  const eventInCookie: Record<
    Exclude<ParamsType["event"], "initiate-checkout">,
    boolean
  > = {
    "add-address-info": Boolean(Cookies.get("add-address-info")),
    "add-payment-info": Boolean(Cookies.get("add-payment-info")),
    "event-paid": Boolean(Cookies.get("event-paid")),
    "payment-upon-generate-payment-data": Boolean(
      Cookies.get("payment-upon-generate-payment"),
    ),
  };

  if (event === "initiate-checkout") {
    const sessionId = Cookies.get("initiate-checkout");

    if (sessionId === offerId) return true;

    return false;
  }

  return eventInCookie[event];
}
