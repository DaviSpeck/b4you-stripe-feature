import { RadioGroup } from "@radix-ui/react-radio-group";
import { useCallback, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { fecthMutation } from "@/utils/fetch";
import { useOfferPayment, useOfferShipping } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { type FrenetOptionType } from "@/pages/api/frenet";
import { findShippingType } from "@/shared/functions/shipping";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface iFrenetShippinProps {
  zipcode: string | null;
  isError: boolean;
  isHidden?: boolean;
  onLoading?: (isLoading: boolean) => void;
}

type frenetBodyRequest = {
  cep: string;
  offer_id: string;
  order_bumps: string[];
};

export function FrenetShipping(props: iFrenetShippinProps) {
  const { onLoading, zipcode, isError, isHidden } = props;

  const { orderBumps } = useOfferPayment();

  const {
    set,
    frenetShippingOptions,
    shippingCompany,
    shippingOrigin,
  } = useOfferShipping();

  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  if (shippingOrigin === "FRENET_FALLBACK") {
    onLoading?.(false);
    return null;
  }

  const { mutate } = fecthMutation<
    FrenetOptionType[],
    frenetBodyRequest
  >({
    method: "post",
    route: "/frenet",
    options: {
      onSuccess(data) {
        if (data.length === 0) {
          set({
            frenetShippingOptions: [],
            shippingPrice: null,
            currentZipcode: zipcode ?? null,
            shippingCompany: null,
            shippingOrigin: "FRENET_FALLBACK",
          });
          return;
        }

        const optionShipping =
          data.find((option) => option.company === shippingCompany) ?? data[0];

        set({
          frenetShippingOptions: data,
          shippingPrice: optionShipping.price,
          currentZipcode: zipcode ?? null,
          shippingCompany: optionShipping.company,
          shippingOrigin: "FRENET_CALCULATED",
        });
      },
      onError() {
        set({
          frenetShippingOptions: [],
          shippingPrice: null,
          shippingCompany: null,
          shippingOrigin: "FRENET_FALLBACK",
        });
      },
      onSettled() {
        onLoading?.(false);
      },
    },
  });

  const handleGetShippings = useCallback(() => {
    if (
      !offerData ||
      !zipcode ||
      isError ||
      findShippingType({ offerData }) !== "FRENET"
    ) {
      return;
    }

    onLoading?.(true);

    mutate({
      cep: zipcode,
      offer_id: offerData.uuid,
      order_bumps: orderBumps,
    });
  }, [zipcode, JSON.stringify(orderBumps)]);

  useEffect(() => {
    handleGetShippings();
  }, [JSON.stringify(orderBumps), zipcode]);

  if (isHidden) return null;

  if (!zipcode && !isError) {
    return (
      <div className="flex flex-col gap-2">
        <span className="block text-[1rem] font-medium text-[#030712]">
          Método de envio
        </span>
        <p className="m-0 bg-[#f8f9fa] p-4 text-[1rem] text-[#6c757d]">
          Preencha seu endereço de entrega para visualizar métodos de entrega.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-2">
        <span className="block text-[1rem] font-medium text-[#030712]">
          Método de envio
        </span>
        <p className="m-0 bg-[#f8f9fa] p-4 text-[1rem] text-[#6c757d]">
          Envio indisponível para esse CEP
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="block text-[1rem] font-medium text-[#030712]">
        Método de envio
      </span>
      <div className="relative">
        <RadioGroup
          value={String(shippingCompany)}
          className="flex w-full flex-col gap-2"
          onValueChange={(value) => {
            const findCompany = frenetShippingOptions.find(
              (option) => option.company === value,
            );

            set({
              shippingPrice: findCompany?.price,
              shippingCompany: findCompany?.company,
            });

            trackEvent("checkout_shipping_method_selected", {
              step: "address",
            });
          }}
        >
          {frenetShippingOptions?.map((option) => (
            <FrenetShipping.Option key={option.company} {...option} />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

FrenetShipping.Option = function (props: FrenetOptionType) {
  const { label, price = 0 } = props;
  const idComponenet = uuid();

  return (
    <div className="flex justify-between rounded-[4px] border p-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem
          id={idComponenet}
          className="hover:cursor-pointer"
          value={String(props.company)}
        />
        <Label
          htmlFor={idComponenet}
          className="text-[0.813rem] text-[#3f3f3f]"
        >
          {label?.replace("undefined", "")}
        </Label>
      </div>
      <span className="block text-[0.813rem] font-medium text-[#3f3f3f]">
        {price === 0 && "Grátis"}
        {price > 0 &&
          price.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}
      </span>
    </div>
  );
};