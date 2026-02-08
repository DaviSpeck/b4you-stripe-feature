import { MdErrorOutline } from "react-icons/md";
import { toast } from "sonner";
import { iCoupon } from "@/interfaces/coupon";
import { PaymentTypes } from "@/interfaces/offer";

type offerDataType = {
  productsAmount: number;
  priceTotal: number;
  methodPayment: PaymentTypes;
  enableTwoCardsPayment: boolean;
};

type FeedbackApplyCouponType = {
  offerData: offerDataType;
  cuponInformations: iCoupon;
};

export function FeedbackApplyCoupon(params: FeedbackApplyCouponType) {
  const { cuponInformations, offerData } = params;

  let message: string = "Cupom válido";
  let plusInformation: null | string = null;

  const isMinPrice: boolean =
    cuponInformations.min_amount > 0 &&
    offerData.priceTotal < cuponInformations.min_amount;

  const isMinProductAmount: boolean =
    cuponInformations.min_items > 0 &&
    offerData.productsAmount < cuponInformations.min_items;

  if (isMinPrice) {
    message = "Cupom inválido";
    plusInformation = `Você precisa adicionar mais R$ ${(cuponInformations.min_amount - offerData.priceTotal).toFixed(2)} para aplicar o cupom`;
  }

  if (isMinProductAmount) {
    message = "Cupom inválido";
    plusInformation = `Você precisa adicionar mais ${cuponInformations.min_items - offerData.productsAmount} para aplicar o cupom`;
  }

  const payment: string[] = cuponInformations.payment_methods
    .split(",")
    .map((option) =>
      option === "billet" ? "BANK_SLIP" : option.toUpperCase(),
    );

  if (offerData.enableTwoCardsPayment) {
    payment.push("TWO_CARDS");
  }

  const paymentsPtBR = payment.map((method) => {
    if (method === "CARD") return "Cartão";
    if (method === "TWO_CARDS") return "Cartão";
    if (method === "PIX") return "Pix";
    if (method === "BANK_SLIP") return "Boleto";
  });

  if (!payment.includes(offerData.methodPayment)) {
    message = "Cupom inválido";
    plusInformation = `Cupom só está valido para pagamentos no ${paymentsPtBR.join().replaceAll(",", ", ")}`;
  }

  if (plusInformation) {
    showInvalidCouponToast(plusInformation);
  }

  return message;
}

export function showInvalidCouponToast(message: string) {
  toast(
    () => (
      <div className="flex items-center gap-2">
        <MdErrorOutline color="red" size={30} />
        <span className="block text-[1rem]">Cupom inválido!</span>
      </div>
    ),
    {
      id: "invalid-coupon",
      description: () => <p className="font-medium text-gray-700">{message}</p>,
    },
  );
}
