import Link from "next/link";
import { useEffect } from "react";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { CalcCouponDiscount } from "@/shared/functions/coupon";
import { orderBumpsTotal } from "@/shared/functions/order-bumps";
import { InstallmentOptionList } from "@/shared/functions/payments";
import { findShippingType } from "@/shared/functions/shipping";
import { ProductList } from "./product-list";
import { TotalProduct } from "./total-product";

export function SummaryProduct() {
  const { shippingPrice, set: setOfferShipping } = useOfferShipping();
  const { set: setOfferData, offerData, getOfferPrice } = useOfferData();
  const { set: setPixelStates } = usePixelStates();

  const {
    offerPriceWithDiscount,
    couponData,
    discountType,
    discountValue,
    isShippingFree,
    set: setOfferCoupon,
  } = useOfferCoupon();

  const {
    set: setOfferPayment,
    updateInstallmentOptions,
    offerPrice,
    orderBumps,
    paymentSelected,
    planId,
  } = useOfferPayment();

  // EFFECT RESPONÁVEL POR ADICIONAR VALOR INICIAL DA OFERTA
  useEffect(() => {
    if (!offerData) return;

    if (!offerData) {
      setOfferData(offerData);
    }

    const shippingType = findShippingType({ offerData });

    if (shippingType === "FREE" || shippingType === "FIX") {
      setOfferShipping({
        shippingFree: shippingType === "FREE" ? true : false,
        shippingPrice:
          shippingType === "FREE" ? null : offerData.shipping_price,
      });
    }

    if (offerData.payment.methods.includes("credit_card")) {
      const { price } = getOfferPrice("CARD");
      setOfferPayment({ paymentSelected: "CARD" });
      setOfferPayment({
        offerPrice: price,
      });
      return;
    }

    if (offerData.payment.methods.includes("pix")) {
      const { price } = getOfferPrice("PIX");
      setOfferPayment({ paymentSelected: "PIX" });
      setOfferPayment({
        offerPrice: price,
      });
      return;
    }

    if (offerData.payment.methods.includes("billet")) {
      const { price } = getOfferPrice("BANK_SLIP");
      setOfferPayment({ paymentSelected: "BANK_SLIP" });
      setOfferPayment({
        offerPrice: price,
      });
      return;
    }
  }, [offerData]);

  // EFFECT RESPONÁVEL POR CONTROLAR VALORES DE PARCELA NO CARTÃO
  useEffect(() => {
    if (!offerData || !offerPrice) return;

    const price = offerPriceWithDiscount ?? offerPrice;

    const options = InstallmentOptionList({
      offerData,
      price: price + (isShippingFree ? 0 : (shippingPrice ?? 0)),
      fixedInstallmentAmount: offerData.payment.installments,
    });

    setPixelStates({ shippingPrice: (price ?? 0) + (shippingPrice ?? 0) });
    updateInstallmentOptions({
      installmentOptions: options,
      initialValue: Number(offerData.customizations.default_installment),
    });
  }, [
    offerPrice,
    shippingPrice,
    couponData,
    offerPriceWithDiscount,
    offerData,
  ]);

  // EFFECT RESPONSÁVEL POR CONTROLAR O VALOR TOTAL DA COMPRA E VALOR COM DESCONTO
  useEffect(() => {
    if (!offerData || !paymentSelected) return;

    const { price, discount } = getOfferPrice(paymentSelected, planId);

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discount,
      paymentSelect: paymentSelected ?? "CARD",
    });

    const offerBumpsPrice = Math.abs(
      totalOrderBumps.priceWithDiscount ?? totalOrderBumps.originalPrice,
    );

    if (couponData) {
      const offerPriceWithDiscount = CalcCouponDiscount({
        couponValue: discountValue!,
        discountType: discountType!,
        priceToApplyDiscount: offerBumpsPrice + price,
      });

      setOfferCoupon({ offerPriceWithDiscount });
    }

    setOfferPayment({
      offerPrice: offerBumpsPrice + price,
      offerOriginalPrice:
        offerData.original_price + totalOrderBumps.originalPrice,
    });
  }, [orderBumps, paymentSelected, shippingPrice]);

  if (!offerData) return <></>;

  return (
    <div className="flex flex-col gap-5 rounded-[6px] bg-white p-10 pb-0">
      <h2 className="w-full text-center text-[1rem] text-[#4b4b4b]">
        Resumo da compra
      </h2>
      <ProductList />
      <TotalProduct />
      <div className="flex w-full flex-col pt-4 font-normal text-[#868686]">
        <p className="w-full text-center text-[0.75rem]">
          Esse site é protegido pelo reCAPTCHA do Google <br />
          {/*<Link
            href="https://blog.b4you.com.br/wp-content/uploads/2023/08/B4you-Poli%CC%81tica-de-Privacidade-do-Site.pdf"
            className="font-bold underline"
            target="_blank"
          >
            Política de Privacidade
          </Link>{" "}
          e{" "} */}
          <Link
            href="https://b4you.com.br/termos"
            rel="noreferrer"
            target="_blank"
            className="font-bold underline"
          >
            Termos de Uso
          </Link>
          <br />
        </p>
      </div>
      <div className="pb-6">
        <p className="w-full text-center text-[0.75rem] text-[#868686]">
          *Parcelamento com acréscimo. Ao prosseguir você concorda com a{" "}
          <Link
            href="https://blog.b4you.com.br/wp-content/uploads/2025/06/B4you-Politica-de-Pagamento.pdf"
            rel="noreferrer"
            target="_blank"
            className="font-bold underline"
          >
            Política de Pagamento
          </Link>
        </p>
      </div>
    </div>
  );
}
