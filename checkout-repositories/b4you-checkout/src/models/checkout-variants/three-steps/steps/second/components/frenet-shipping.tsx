import { RadioGroup } from "@radix-ui/react-radio-group";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { fecthMutation } from "@/utils/fetch";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { type FrenetOptionType } from "@/pages/api/frenet";
import { findShippingType } from "@/shared/functions/shipping";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface iFrenetShippinProps {
  zipcode: string | null;
  shippingPrice: null | number;
  isError: boolean;
  onLoading(isLoading: boolean): void;
}

type frenetBodyRequest = {
  cep: string;
  offer_id: string;
  order_bumps: string[];
};

export function FrenetShipping(props: iFrenetShippinProps) {
  const { onLoading, zipcode, isError } = props;

  const { orderBumps } = useOfferPayment();

  const {
    set,
    shippingFree,
    frenetShippingOptions,
    currentZipcode,
    shippingCompany,
  } = useOfferShipping();

  const { isShippingFree } = useOfferCoupon();

  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const { mutate, isPending } = fecthMutation<
    FrenetOptionType[],
    frenetBodyRequest
  >({
    method: "post",
    route: "/frenet",
    options: {
      mutationKey: ["frenet-options", String(zipcode)],
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
        });
      },
    },
  });



  useEffect(() => {
    if (
      !offerData ||
      zipcode?.length !== 9 ||
      offerData.product.type !== "physical"
    ) {
      return;
    }
    findShippingType({ offerData }) === "FRENET" &&
      !shippingFree &&
      !isShippingFree &&
      offerData.product.type === "physical" &&
      mutate({
        cep: zipcode,
        offer_id: offerData.uuid,
        order_bumps: orderBumps,
      });
  }, [zipcode, orderBumps]);

  useEffect(() => {
    onLoading(isPending);
  }, [isPending]);

  if (isShippingFree || shippingFree) return <></>;

  if (!zipcode && !isError) {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <span className="block text-[0.813rem] font-medium text-[#030712]">
            Método de envio
          </span>
        </div>
        <p className="m-0 bg-[#f8f9fa] p-4 text-[0.85rem] text-[#6c757d]">
          Preencha seu endereço de entrega para visualizar métodos de entrega.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <span className="block text-[0.813rem] font-medium text-[#030712]">
            Método de envio
          </span>
        </div>
        <p className="m-0 bg-[#f8f9fa] p-4 text-[1rem] text-[#6c757d]">
          Envio indisponível para esse CEP
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="rounded-md bg-[#f0f0f071] py-8">
        <div className="flex w-full animate-pulse items-center justify-center gap-2 text-gray-500">
          <span className="block">Buscandos fretes...</span>
        </div>
      </div>
    );
  }

  return (
    <RadioGroup
      value={String(shippingCompany)}
      className="flex w-full flex-col gap-2"
      onValueChange={(value) => {
        const option = frenetShippingOptions.find(
          (opt) => opt.company === value,
        );
        if (option) {
          set({
            shippingPrice: option.price,
            shippingCompany: option.company,
          });
          trackEvent("checkout_shipping_method_selected", {
            step: "address",
          });
        }
      }}
    >
      {zipcode &&
        currentZipcode === zipcode &&
        frenetShippingOptions.map((option) => (
          <FrenetShipping.Option key={option.company} {...option} />
        ))}
    </RadioGroup>
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
