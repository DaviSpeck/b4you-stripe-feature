import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaArrowRightLong } from "react-icons/fa6";
import { v4 as uuid } from "uuid";
import z from "zod";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { fecthMutation, fecthRead } from "@/utils/fetch";
import { statesArr } from "@/utils/state-cities";
import { CustomInput } from "@/components/custom-inputs-form";
import { CustomSelect } from "@/components/custom-select";
import { useAddressInformationEvents } from "@/hooks/integrations/pixel-events/useAddressInformation";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { iAddressInformationByZipcodeTypeViaCep } from "@/interfaces/address";
import { queryClient } from "@/pages/_app";
import { iAbandonedCartResponse } from "@/pages/api/cart/find/[cartId]";
import { iCartInitiateBody } from "@/pages/api/cart/initiate-cart";
import { FormaterZipCode } from "@/shared/formaters";
import {
  findShippingType,
  shippingPriceByRegion,
} from "@/shared/functions/shipping";
import { hasAnyShippingOption, ShippingType } from "@/shared/functions/shipping/identify-shipping-type";
import { userDataStore } from "@/shared/user-data-store";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { FrenetShipping } from "./components/frenet-shipping";
import { formAddressSecondStepSchema } from "./form-schema";
import { iAddress, iFormDataSecondStep } from "./interfaces";

export function FormSecondStep() {
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [searchParams] = useQueryStates({
    step: parseAsString.withDefault(""),
    zipcode: parseAsString.withDefault(""),
    street: parseAsString.withDefault(""),
    city: parseAsString.withDefault(""),
    neighborhood: parseAsString.withDefault(""),
    number_address: parseAsString.withDefault(""),
    state: parseAsString.withDefault(""),
    complement: parseAsString.withDefault(""),
    cartId: parseAsString.withDefault(""),
    src: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const { firstStepFormData, secondStepFormData, set, stepSubmit } =
    useOfferCheckoutSteps();

  const dataStore = userDataStore();

  const form = useForm<iFormDataSecondStep>({
    resolver: zodResolver(formAddressSecondStepSchema),
    mode: "onChange",
    defaultValues: {
      city:
        secondStepFormData?.city ??
        (Boolean(searchParams.city) ? searchParams.city : dataStore.city),
      state:
        secondStepFormData?.state ??
        (Boolean(searchParams.state) ? searchParams.state : dataStore.state),
      street:
        secondStepFormData?.street ??
        (Boolean(searchParams.street) ? searchParams.street : dataStore.street),
      zipcode:
        secondStepFormData?.zipcode ??
        (Boolean(searchParams.zipcode)
          ? FormaterZipCode(searchParams.zipcode)
          : dataStore.zipcode),
      complement:
        secondStepFormData?.complement ??
        (Boolean(searchParams.complement)
          ? searchParams.complement
          : dataStore.complement),
      neighborhood:
        secondStepFormData?.neighborhood ??
        (Boolean(searchParams.neighborhood)
          ? searchParams.neighborhood
          : dataStore.neighborhood),
      number_address:
        secondStepFormData?.number_address ??
        (Boolean(searchParams.number_address)
          ? searchParams.number_address
          : dataStore.number_address),
    },
  });

  const {
    set: setOfferShipping,
    shippingPrice,
    isShippingRequired,
    shippingFree,
    shippingOrigin
  } = useOfferShipping();

  const { offerPrice } = useOfferPayment();

  const { isShippingFree, couponData } = useOfferCoupon();

  const { offerData } = useOfferData();
  const shippingType: ShippingType = findShippingType({ offerData });

  useEffect(() => {
    if (!offerData) return;

    if (shippingType === "FREE") {
      setOfferShipping({
        shippingPrice: 0,
        shippingFree: true,
        currentZipcode: form.getValues("zipcode") ?? null,
      });

      setPixelState({ shippingPrice: 0 });
    }

    if (shippingType === "FIX") {
      const price = Number(offerData.shipping_price ?? 0);

      setOfferShipping({
        shippingPrice: price,
        shippingFree: price === 0,
        currentZipcode: form.getValues("zipcode") ?? null,
      });

      setPixelState({ shippingPrice: price });
    }
  }, [offerData]);

  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const hasStartedRef = useRef(false);
  const hasFilledRef = useRef(false);
  const lastSubmitCountRef = useRef(0);

  const { set: setPixelState } = usePixelStates();

  const oldCartDataCache = queryClient.getQueryData([
    "old-cart",
    searchParams.cartId,
  ]) as null | iAbandonedCartResponse;

  const zipcodeAddressDataCache = queryClient.getQueryData([
    "zipcode",
    form.getValues("zipcode"),
  ]) as null | Omit<iAddress, "complement" | "number">;

  // BUSCA OS DADOS DO CARRINHO ABANDONADO
  const { data: oldCartData, isFetching: isLoadingOldCart } =
    fecthRead<iAbandonedCartResponse>({
      queryKey: ["old-cart", searchParams.cartId],
      route: `/cart/find/${searchParams.cartId}`,
      options: {
        enabled:
          !oldCartDataCache &&
          Boolean(searchParams.cartId) &&
          Boolean(form.getValues("zipcode")),
      },
    });

  // BUSCA OS DADOS DO ENDEREÇO PELO CEP
  let isEnable =
    form.getValues("zipcode").length === 9 && !zipcodeAddressDataCache;

  if (
    form.getValues("zipcode").length === 9 &&
    secondStepFormData &&
    secondStepFormData.zipcode !== form.getValues("zipcode")
  ) {
    isEnable = true;
  }

  if (!Boolean(form.getValues("zipcode")) && secondStepFormData) {
    isEnable = false;
  }
  const { isError, isFetching: isLoadingZipcode } = fecthRead<
    iAddressInformationByZipcodeTypeViaCep | { erro: boolean }
  >({
    queryKey: ["zipcode", form.getValues("zipcode")],
    fullUrl: `https://viacep.com.br/ws/${form.getValues("zipcode").replace(/[^\d]/g, "")}/json`,
    options: {
      retry: false,
      select(data: iAddressInformationByZipcodeTypeViaCep | { erro: boolean }) {
        if (!("erro" in data)) {
          const res = {
            city: data.localidade,
            state: data.uf,
            street: data.logradouro,
            neighborhood: data.bairro,
            zipcode: FormaterZipCode(data.cep),
          };
          queryClient.setQueryData(["zipcode", form.getValues("zipcode")], res);
          return data;
        }
        form.setError("zipcode", { message: "CEP inválido" });
        return data;
      },
      enabled: isEnable,
    },
  });

  function handleShippingRegionValue() {
    if (!offerData || !Boolean(form.getValues("zipcode"))) return;

    if (shippingType !== "REGION") return;

    setPixelState({
      shippingPrice: shippingPriceByRegion({
        offerData,
        zipcode: form.getValues("zipcode"),
      }),
    });

    const price = shippingPriceByRegion({
      offerData,
      zipcode: form.getValues("zipcode"),
    });

    setOfferShipping({
      currentZipcode: form.getValues("zipcode"),
      shippingPrice: price,
      shippingFree: price === 0,
    });
  }

  if (!offerData) return <></>;

  const { mutate } = fecthMutation<unknown, iCartInitiateBody>({
    method: "post",
    route: "/cart/initiate-cart",
    options: {
      mutationKey: ["cart-initiate"],
    },
  });

  const handlerInitiateCart = (data: iFormDataSecondStep) => {
    mutate({
      offer_uuid: offerData!.uuid,
      full_name: firstStepFormData!.full_name,
      email: firstStepFormData!.email,
      whatsapp: firstStepFormData!.whatsapp,
      address: {
        zipcode: data.zipcode,
        street: data.street,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood,
        number: data.number_address,
        complement: data.complement,
      },
      params: {
        src: Boolean(searchParams.src) ? searchParams.src : null,
        sck: Boolean(searchParams.sck) ? searchParams.sck : null,
        utm_campaign: Boolean(searchParams.utm_campaign)
          ? searchParams.utm_campaign
          : null,
        utm_content: Boolean(searchParams.utm_content)
          ? searchParams.utm_content
          : null,
        utm_medium: Boolean(searchParams.utm_medium)
          ? searchParams.utm_medium
          : null,
        utm_source: Boolean(searchParams.utm_source)
          ? searchParams.utm_source
          : null,
        utm_term: Boolean(searchParams.utm_term) ? searchParams.utm_term : null,
      },
    });
  };

  const onSubmit: SubmitHandler<iFormDataSecondStep> = (data) => {
    const hasValidShipping = hasAnyShippingOption({
      shippingType,
      shippingPrice,
      shippingFree,
      isShippingFree,
    });

    const shouldBlockCheckout =
      isShippingRequired() &&
      shippingType !== "FRENET" &&
      !hasValidShipping;

    if (shouldBlockCheckout) {
      trackEvent("checkout_address_error", {
        step: "address",
      });
      return;
    }
    set({ secondStepFormData: data });
    stepSubmit({
      isRequiredAddress: offerData.require_address,
      hasFrenet: offerData?.has_frenet ? true : false,
    });
    setPixelState({ isAddressInformations: true });
    userDataStore({
      ...data,
      city: data.city ?? "",
      state: data.state ?? "",
      complement: data.complement ?? "",
    });

    handlerInitiateCart(data);

    const eventId = uuid();

    useAddressInformationEvents(offerData).handler({
      eventId,
      shippingPrice: shippingPrice ?? 0,
      offerInformations: {
        uuid: offerData.uuid,
        name: offerData.offer.alternative_name ?? offerData.offer.name,
      },
      paymentData: {
        value: offerPrice ?? 0,
        couponName: couponData?.coupon,
      },
      addressData: {
        zip: form.getValues("zipcode"),
        street: form.getValues("street"),
        region: form.getValues("state") ?? "",
        city: form.getValues("city") ?? "",
      },
    });

    trackEvent("checkout_address_completed", {
      step: "address",
    });
  };

  const onSetValueField = (name: keyof iFormDataSecondStep, value: string) => {
    localStorage.setItem(
      "user-info-data",
      encryptData({ ...form.getValues(), [name]: value }).encrypted,
    );
  };

  useEffect(() => {
    form.trigger();
    form.setFocus("zipcode");
    if (!secondStepFormData) {
      const data = userDataStore();
      form.setValue("city", data.city);
      form.setValue("state", data.state);
      form.setValue("zipcode", data.zipcode);
      form.setValue("street", data.street);
      form.setValue("neighborhood", data.neighborhood);
      form.setValue("number_address", data.number_address);
      form.setValue("complement", data.complement);
    }
  }, []);

  useEffect(() => {
    if (
      form.formState.isValid &&
      (form.formState.isDirty || form.formState.isSubmitted) &&
      !hasFilledRef.current
    ) {
      trackEvent("checkout_address_filled", {
        step: "address",
      });
      hasFilledRef.current = true;
    }
  }, [
    form.formState.isValid,
    form.formState.isDirty,
    form.formState.isSubmitted,
    trackEvent,
  ]);

  useEffect(() => {
    const submitCount = form.formState.submitCount;
    if (submitCount === lastSubmitCountRef.current) return;
    lastSubmitCountRef.current = submitCount;

    if (!form.formState.isValid) {
      trackEvent("checkout_address_error", {
        step: "address",
      });
    }
  }, [form.formState.submitCount, form.formState.isValid, trackEvent]);

  // RESETA VALOR DO FRETE QUANDO O CEP ESTÁ INVÁLIDO
  useEffect(() => {
    if (shippingType === "FIX" || shippingType === "FREE") return;

    if (!zipcodeAddressDataCache) {
      if (shippingType === "FRENET") {
        setOfferShipping({
          currentZipcode: null,
          shippingPrice: null,
          shippingFree: false,
          shippingOrigin: undefined,
        });

        setPixelState({ shippingPrice: 0 });
      } else {
        setOfferShipping({
          currentZipcode: null,
          shippingPrice: null,
          shippingFree: false,
        });
      }
      return;
    }

    if (shippingType === "REGION" && shippingPrice === null) {
      handleShippingRegionValue();
    }
  }, [zipcodeAddressDataCache]);

  // EFFECT QUE ATUALIZA OD DADOS DOS INPUTS DE ENDEREÇO
  useEffect(() => {
    if (!zipcodeAddressDataCache) return;

    const data: Omit<iFormDataSecondStep, "zipcode"> = {
      city: zipcodeAddressDataCache.city,
      state: zipcodeAddressDataCache.state,
      neighborhood: zipcodeAddressDataCache.neighborhood,
      number_address: secondStepFormData?.number_address ?? "",
      street: zipcodeAddressDataCache.street,
      complement: secondStepFormData?.complement ?? "",
    };

    if (Boolean(searchParams.cartId) && !oldCartDataCache) return;
    if (Boolean(searchParams.step)) return;

    Object.entries(data).forEach(([key, value]) =>
      form.setValue(key as keyof iFormDataSecondStep, value, {
        shouldValidate: true,
      }),
    );

    const dataStorage = userDataStore();
    form.setValue("number_address", dataStorage.number_address, {
      shouldValidate: true,
    });

    setOfferShipping({ currentZipcode: zipcodeAddressDataCache.zipcode });
  }, [zipcodeAddressDataCache]);

  // EFFETC RESPONSÁVEL POR CARRINHO ABANDONADO
  useEffect(() => {
    if (!Boolean(searchParams.cartId) && secondStepFormData) return;

    if (isLoadingOldCart) return;

    if (oldCartData && oldCartData.address) {
      const data: iFormDataSecondStep = {
        zipcode: FormaterZipCode(
          secondStepFormData?.zipcode ?? oldCartData.address.zipcode,
        ),
        city: oldCartData.address?.city,
        state: oldCartData.address?.state ?? "",
        street: secondStepFormData?.street ?? oldCartData.address?.street,
        neighborhood:
          secondStepFormData?.neighborhood ?? oldCartData.address.neighborhood,
        number_address:
          secondStepFormData?.number_address ??
          oldCartData.address.number ??
          "",
        complement:
          secondStepFormData?.complement ?? oldCartData.address.complement,
      };

      if (offerData) {
        shippingType === "REGION" &&
          setPixelState({
            shippingPrice: shippingPriceByRegion({
              offerData,
              zipcode: data.zipcode,
            }),
          });
      }

      Object.entries(data).forEach(([key, value]) =>
        form.setValue(key as keyof iFormDataSecondStep, value, {
          shouldValidate: true,
        }),
      );

      handleShippingRegionValue();
    }
  }, [searchParams.cartId, oldCartData, isLoadingOldCart]);

  // GURDA DADOS INFORMADO PELO USUÁRIO
  useEffect(() => {
    if (searchParams.step) return;

    const encryptedUserInfo = localStorage.getItem("user-info-data");

    if (!encryptedUserInfo) return;

    const userInfoDecrypted = decryptData({
      encrypted: encryptedUserInfo,
    }) as iFormDataSecondStep;

    Object.entries(userInfoDecrypted).forEach(([key, value]) =>
      form.setValue(key as keyof iFormDataSecondStep, value, {
        shouldValidate: true,
      }),
    );
  }, []);

  // EFFETC RESPONSÁVEL POR INTEGRAÇÃO COM A PAYLOG
  useEffect(() => {
    const isZipcode = Boolean(form.getValues("zipcode"));

    if (!Boolean(searchParams.step) || isLoadingZipcode) return;

    if (zipcodeAddressDataCache) {
      const data: iFormDataSecondStep = {
        zipcode: FormaterZipCode(zipcodeAddressDataCache.zipcode),
        number_address: searchParams.number_address,
        complement: searchParams.complement,
        city: Boolean(searchParams.city)
          ? searchParams.city
          : zipcodeAddressDataCache.city,
        state: Boolean(searchParams.state)
          ? searchParams.state
          : zipcodeAddressDataCache.state,
        neighborhood: Boolean(searchParams.neighborhood)
          ? searchParams.neighborhood
          : zipcodeAddressDataCache.neighborhood,
        street: Boolean(searchParams.street)
          ? searchParams.street
          : zipcodeAddressDataCache.street,
      };

      Object.entries(data).forEach(([key, value]) =>
        form.setValue(key as keyof iFormDataSecondStep, value),
      );

      !offerData?.has_frenet &&
        set({ currentStep: "three", secondStepFormData: form.getValues() });

      const dataStore = userDataStore();
      form.setValue("number_address", dataStore.number_address);
    }

    if (!isZipcode) {
      form.setValue("zipcode", FormaterZipCode(searchParams.zipcode), {
        shouldValidate: true,
      });
    }

    handleShippingRegionValue();
  }, [searchParams.step, zipcodeAddressDataCache, isLoadingZipcode]);

  if (!offerData) return <></>;

  form.watch("complement");
  form.watch("zipcode");

  return (
    <>
      <Form {...form}>
        <form
          id="form-second-step"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-6"
        >
          <div className="flex flex-col gap-4">
            <CustomInput
              id="field-zipcode"
              name="zipcode"
              placeholder="CEP"
              label="CEP"
              disabled={isLoadingZipcode || Boolean(searchParams.step)}
              control={form.control}
              formater={FormaterZipCode}
              onValueChange={(e) =>
                onSetValueField("zipcode", FormaterZipCode(e.target.value))
              }
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_address_started", {
                  step: "address",
                });
              }}
            />
            {((zipcodeAddressDataCache && !form.formState.errors.zipcode) ||
              isError) && (
                <>
                  {isError && !Boolean(searchParams.step) && (
                    <FormSecondStep.CityState />
                  )}
                  <CustomInput
                    id="field-street"
                    name="street"
                    placeholder="Endereço"
                    label="Endereço"
                    control={form.control}
                    disabled={isFetching || Boolean(searchParams.step)}
                    onValueChange={(e) =>
                      onSetValueField("street", e.target.value)
                    }
                  />
                  <CustomInput
                    id="field-number-address"
                    name="number_address"
                    label="Número"
                    placeholder="Número"
                    control={form.control}
                    checkboxPosition="in"
                    checkboxLabel="S/N"
                    disabled={isFetching || Boolean(searchParams.step)}
                    onValueChange={(e) =>
                      onSetValueField("number_address", e.target.value)
                    }
                  />
                  <CustomInput
                    id="field-neighborhood"
                    name="neighborhood"
                    label="Bairro"
                    placeholder="Bairro"
                    control={form.control}
                    disabled={isFetching || Boolean(searchParams.step)}
                    onValueChange={(e) =>
                      onSetValueField("neighborhood", e.target.value)
                    }
                  />
                  <div className="relative">
                    <CustomInput
                      className="pr-12"
                      maxLength={40}
                      id="field-complement"
                      name="complement"
                      label="Complemento"
                      placeholder="Complemento"
                      control={form.control}
                      disabled={isFetching || Boolean(searchParams.step)}
                      onValueChange={(e) =>
                        onSetValueField("complement", e.target.value)
                      }
                    />
                    <span className="absolute top-8 right-2.5 block text-[0.75rem] text-gray-400">
                      {form.getValues("complement")?.length ?? 0}/40
                    </span>
                  </div>
                </>
              )}
          </div>

          {shippingType === "FRENET" &&
            shippingOrigin !== "FRENET_FALLBACK" && (
              <FrenetShipping
                shippingPrice={shippingPrice}
                isError={"erro" in (zipcodeAddressDataCache ?? {})}
                zipcode={
                  Boolean(form.getValues("zipcode"))
                    ? form.getValues("zipcode")
                    : null
                }
                onLoading={(isLoading) => setIsFetching(isLoading)}
              />
            )}

          <div className="flex flex-col">
            <Button
              id="second-step-btn-submit"
              disabled={isLoadingZipcode || isLoadingOldCart || isFetching}
              className="h-[50px] cursor-pointer bg-[#20c374] hover:bg-[#20c374]"
            >
              {isLoadingZipcode || isLoadingOldCart || isFetching
                ? "Carregando"
                : "Continuar"}
              {!isLoadingZipcode && !isLoadingOldCart && !isFetching ? (
                <FaArrowRightLong size={20} />
              ) : (
                <AiOutlineLoading3Quarters size={16} className="animate-spin" />
              )}
            </Button>
            {!form.formState.isValid &&
              !isFetching &&
              form.formState.isSubmitted && (
                <span className="py-1.5 text-center text-[0.75rem] text-red-500">
                  Preencha todos os campos corretamente.
                </span>
              )}
          </div>
        </form>
      </Form>
    </>
  );
}

type addressFieldsType = z.infer<typeof formAddressSecondStepSchema>;

// INPUT DE CIDADE E ESTADO
FormSecondStep.CityState = function () {
  const form = useFormContext<addressFieldsType>();

  useEffect(() => {
    if (Boolean(form.getValues("state"))) return;
    form.setValue("state", statesArr[0].sigla, { shouldValidate: true });
  }, [form.getValues("state")]);

  useEffect(() => {
    if (!Boolean(form.getValues("city"))) return;

    const findState = statesArr.find(
      (state) => state.sigla === form.getValues("state"),
    );

    if (!findState) return;

    form.setValue("city", findState.cidades[0]);
  }, [form.getValues("state")]);

  const stateOptions = statesArr.map((state) => ({
    id: state.sigla,
    label: state.sigla,
    value: state.sigla,
  }));

  const citiesOptions = Boolean(form.getValues("city"))
    ? statesArr
      .find((state) => state.sigla === form.getValues("state"))!
      .cidades?.map((city) => ({
        id: city,
        label: city,
        value: city,
      }))
    : [];

  return (
    <div className="flex gap-1">
      <div className="w-[25%]">
        <Label className="pl-1 text-[0.8128rem] font-medium text-[#3f3f3f]">
          UF
        </Label>
        <CustomSelect
          placeholder="UF"
          value={form.getValues("state") ?? ""}
          data={stateOptions}
          onValueChange={(value) => {
            Boolean(value) &&
              form.setValue("state", value, { shouldValidate: true });
          }}
        />
      </div>
      <div className="w-[80%]">
        <Label className="pl-1 text-[0.8128rem] font-medium text-[#3f3f3f]">
          Cidade
        </Label>
        <CustomSelect
          placeholder="Selecione sua cidade"
          value={form.getValues("city") ?? ""}
          data={citiesOptions}
          onValueChange={(value) => {
            Boolean(value) &&
              form.setValue("city", value, { shouldValidate: true });
          }}
        />
      </div>
    </div>
  );
};
