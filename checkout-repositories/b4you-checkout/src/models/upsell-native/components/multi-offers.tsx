import { useEffect } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoImageOutline } from "react-icons/io5";
import { iUpsellOffer } from "@/interfaces/offer";
import { useUpsellNativeStorage } from "../storage";

interface MultiOffersProps {
  offers: iUpsellOffer[];
}

export const MultiOffers = ({ offers }: MultiOffersProps) => {
  const { set, offerSelectUuid } = useUpsellNativeStorage();

  useEffect(() => {
    if (!offers?.length) return;

    const exists = offers.some((o) => o.uuid === offerSelectUuid);

    if (!exists) {
      set({ offerSelectUuid: offers[0].uuid });
    }
  }, [offers, offerSelectUuid, set]);

  if (!offers?.length) return null;

  return (
    <div className="flex flex-col gap-2.5 pb-4">
      {offers.map((offer) => (
        <Product key={offer.uuid} offer={offer} />
      ))}
    </div>
  );
};

function Product({ offer }: { offer: iUpsellOffer }) {
  const { set, offerSelectUuid, isOneClick } = useUpsellNativeStorage();

  const isSelected = offerSelectUuid === offer.uuid;

  const title =
    offer.offer.alternative_name || offer.offer.name || "Oferta";

  const image =
    offer.customizations?.alternative_image ??
    offer.product?.cover ??
    null;

  const description =
    offer.customizations?.show_custom_description === "true"
      ? offer.description
      : null;

  const totalPrice = offer.totalPrice;
  const main = offer.mainPaymentMethod;
  const installments = offer.payment.installments ?? 1;
  const installmentValue =
    installments > 1 ? totalPrice / installments : totalPrice;

  return (
    <div
      className="relative flex cursor-pointer flex-row gap-2 rounded-[8px] border border-[#d9d9d9] bg-white p-3 hover:border-[#0f1b35]"
      onClick={() =>
        set({
          offerSelectUuid: offer.uuid,
          planSelect: null,
        })
      }
      style={isSelected ? { borderColor: "#0f1b35" } : undefined}
    >
      {isSelected && (
        <IoIosCheckmarkCircleOutline
          className="absolute top-2 right-3 text-green-600"
          size={20}
        />
      )}

      {!image ? (
        <div className="flex h-14 items-center justify-center rounded-[4px] bg-[#e0e0e0] px-3">
          <IoImageOutline size={20} />
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          className="h-14 w-14 rounded-[4px] object-cover"
        />
      )}

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[0.9rem]">{title}</h1>
          {description && <p className="text-sm">{description}</p>}
        </div>

        <div className="flex flex-col items-end text-sm">
          {main === "credit_card" && installments > 1 && !isOneClick && (
            <span>
              {installments}x{" "}
              {installmentValue.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
          )}

          <span>
            {totalPrice.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}{" "}
            à vista
          </span>
        </div>
      </div>
    </div>
  );
}