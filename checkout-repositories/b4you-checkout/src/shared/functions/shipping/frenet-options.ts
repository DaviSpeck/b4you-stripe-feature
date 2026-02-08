import { useEffect } from "react";
import { fecthMutation } from "@/utils/fetch";
import { useOfferData } from "@/hooks/states/useOfferData";
import { frenetBodyRequestType } from "@/interfaces/address";
import { FrenetOptionType } from "@/pages/api/frenet";
import { findShippingType } from "./identify-shipping-type";

interface iParams {
  zipcode: string;
  orderBumps: string[];
  offerUuid: string;
}

type ResponseType = Promise<{
  frenetOptions: FrenetOptionType[];
  initialValue: number;
}>;

export async function frenetShippingOptionList(params: iParams): ResponseType {
  const { zipcode, orderBumps, offerUuid } = params;

  const { offerData } = useOfferData();

  const rawZipcode = zipcode.replace(/\D+/g, "");

  const { mutate, data, isPending } = fecthMutation<
    FrenetOptionType[],
    frenetBodyRequestType
  >({
    method: "post",
    route: "/frenet",
  });

  useEffect(() => {
    if (
      !Boolean(rawZipcode) ||
      (offerData && findShippingType({ offerData }) !== "FRENET")
    ) {
      return;
    }

    mutate({
      cep: rawZipcode,
      order_bumps: orderBumps,
      offer_id: offerUuid,
    });
  }, [rawZipcode]);

  if (!data || isPending) {
    return { frenetOptions: [], initialValue: 0 };
  }

  const frenetOptions = data
    .map((option) => ({ ...option, price: option.price ?? 0 }))
    .reverse();

  return {
    frenetOptions,
    initialValue: frenetOptions.length === 0 ? 0 : frenetOptions[0].price,
  };
}
