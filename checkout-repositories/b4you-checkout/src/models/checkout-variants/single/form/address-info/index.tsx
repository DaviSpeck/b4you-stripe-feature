import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching } from "@tanstack/react-query";
import { motion } from "motion/react";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AiOutlineHome } from "react-icons/ai";
import { BiBuildingHouse } from "react-icons/bi";
import { GrMapLocation } from "react-icons/gr";
import { LiaBoxSolid, LiaRoadSolid, LiaStreetViewSolid } from "react-icons/lia";
import { z } from "zod";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { fecthRead } from "@/utils/fetch";
import { CustomInput } from "@/components/custom-inputs-form";
import { useOfferCoupon, useOfferShipping } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { iAddressInformationByZipcodeTypeViaCep } from "@/interfaces/address";
import { iAddress } from "@/models/checkout-variants/three-steps/steps/second/interfaces";
import { queryClient } from "@/pages/_app";
import { FormaterZipCode } from "@/shared/formaters";
import {
  findShippingType,
  shippingPriceByRegion,
} from "@/shared/functions/shipping";
import { cn } from "@/shared/libs/cn";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { useCheckoutStorage } from "../storage";
import { FormAddressInfoValidation } from "./_schema";

type formType = z.infer<typeof FormAddressInfoValidation>;

export const AddressInfo = forwardRef<{ execute: () => void }>((_, ref) => {
  const [searchParams] = useQueryStates({
    zipcode: parseAsString.withDefault(""),
    city: parseAsString.withDefault(""),
    state: parseAsString.withDefault(""),
    neighborhood: parseAsString.withDefault(""),
    street: parseAsString.withDefault(""),
    number_address: parseAsString.withDefault(""),
    complement: parseAsString.withDefault(""),
    integration: parseAsString.withDefault(""),
  });

  const form = useForm<formType>({
    mode: "onChange",
    resolver: zodResolver(FormAddressInfoValidation),
    defaultValues: {
      zipcode: searchParams.zipcode,
      city: searchParams.city,
      state: searchParams.state,
      neighborhood: searchParams.neighborhood,
      street: searchParams.street,
      number_address: searchParams.number_address,
      complement: searchParams.complement,
    },
  });

  const { offerData } = useOfferData();
  const { set: setOfferShipping } = useOfferShipping();
  const { set: setPixelState } = usePixelStates();
  const { couponData } = useOfferCoupon();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const hasStartedRef = useRef(false);
  const hasFilledRef = useRef(false);
  const lastSubmitCountRef = useRef(0);

  const addressDataCache = queryClient.getQueryData([
    "zipcode",
    form.getValues("zipcode"),
  ]) as Omit<iAddress, "number" | "complement"> | { error: boolean };

  const onSubmit = (data: formType) => {
    useCheckoutStorage.setState({ addressInfo: data, addressInfoError: false });
    trackEvent("checkout_address_completed", {
      step: "address",
    });
  };

  useImperativeHandle(ref, () => ({
    execute: form.handleSubmit(onSubmit),
  }));

  // BUSCA OS DADOS DO ENDEREÇO PELO CEP
  const { data: addressData, isFetching: isLoadingZipcode } =
    fecthRead<iAddressInformationByZipcodeTypeViaCep>({
      queryKey: ["zipcode", form.watch("zipcode")],
      fullUrl: `https://viacep.com.br/ws/${form.getValues("zipcode").replace(/[^\d]/g, "")}/json`,
      options: {
        retry: false,
        select(data: iAddressInformationByZipcodeTypeViaCep) {
          if (!("erro" in data)) {
            const res = {
              city: data.localidade,
              state: data.uf,
              street: data.logradouro,
              neighborhood: data.bairro,
              zipcode: FormaterZipCode(data.cep),
            };

            queryClient.setQueryData(
              ["zipcode", form.getValues("zipcode")],
              res,
            );
            return data;
          }
          form.setError("zipcode", { message: "CEP inválido" });
          return data;
        },
        enabled: Boolean(form.watch("zipcode")?.length === 9),
      },
    });

  function handleShippingValue() {
    if (!offerData || !Boolean(form.getValues("zipcode"))) return;

    const shippingType = findShippingType({ offerData });

    if (shippingType === "FRENET") return;

    let price: number | null = null;

    if (shippingType === "FIX") {
      price = offerData.shipping_price;
    }

    if (shippingType === "REGION") {
      price = shippingPriceByRegion({
        offerData,
        zipcode: form.getValues("zipcode"),
      });
    }

    setPixelState({
      shippingPrice: price,
    });

    setOfferShipping({
      shippingPrice: price,
      shippingFree: price === 0,
      currentZipcode: form.watch("zipcode"),
    });
  }

  const onSetValueField = (name: keyof formType, value: string) => {
    localStorage.setItem(
      "address-info-data",
      encryptData({ ...form.getValues(), [name]: value }).encrypted,
    );
  };

  useEffect(() => {
    if (!addressDataCache || !offerData) return;

    Object.entries(addressDataCache).forEach(([key, value]) =>
      form.setValue(key as keyof formType, value),
    );

    useCheckoutStorage.setState({
      addressInfo: form.watch(),
    });

    if (offerData.product.type === "physical") handleShippingValue();
  }, [addressData, isLoadingZipcode]);

  useEffect(() => {
    if (!offerData) return;
    if (offerData.product.type === "physical") handleShippingValue();
  }, [couponData]);

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

  useEffect(() => {
    if (!offerData) return;

    if (
      form.watch("zipcode").replace(/\D/, "").length < 8 ||
      form.formState.errors.zipcode
    ) {
      setOfferShipping({
        shippingPrice: null,
      });
    }
  }, [form.watch("zipcode")]);

  // guarda dados informados pelo usuário
  useEffect(() => {
    if (searchParams.integration || !offerData) return;

    const encryptedAddressInfo = localStorage.getItem("address-info-data");

    if (!encryptedAddressInfo) return;

    const addressInfoDecrypted = decryptData({
      encrypted: encryptedAddressInfo,
    });

    Object.entries(addressInfoDecrypted).forEach(([key, value]) => {
      if (key !== "zipcode") {
        form.setValue(key as keyof formType, value);
      }

      if (key === "zipcode") {
        form.setValue("zipcode", FormaterZipCode(value as string));
      }
    });

    if (offerData.product.type === "physical") handleShippingValue();
  }, []);

  const isFetching = Boolean(useIsFetching());

  let isShowAddress = addressData ? true : false;

  if ((addressData && "erro" in addressData) || form.formState.errors.zipcode) {
    isShowAddress = false;
  }

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 min-[770px]:flex-row">
          <CustomInput
            id="field-zipcode"
            className="h-10"
            name="zipcode"
            remove={{ label: true }}
            placeholder="CEP"
            disabled={isFetching || isLoadingZipcode}
            control={form.control}
            formater={FormaterZipCode}
            icon={<LiaBoxSolid className="absolute top-2.5 left-3" size={20} />}
            onValueChange={(e) => onSetValueField("zipcode", e.target.value)}
            onFocus={() => {
              if (hasStartedRef.current) return;
              hasStartedRef.current = true;
              trackEvent("checkout_address_started", {
                step: "address",
              });
            }}
          />

          <CustomInput
            id="field-number-address"
            className={cn(
              "h-10 rounded-[4px]",
              !isShowAddress && "hidden opacity-0",
            )}
            name="city"
            remove={{ label: true }}
            control={form.control}
            value={`${form.getValues("city")}/${form.getValues("state")}`}
            placeholder="Número"
            disabled={true}
            checkboxLabel="S/N"
            icon={
              <GrMapLocation
                className={cn(
                  "absolute top-2.5 left-3",
                  !isShowAddress && "hidden opacity-0",
                )}
                size={18}
              />
            }
          />
        </div>
        {isShowAddress && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col items-start gap-2 min-[770px]:flex-row">
              <CustomInput
                id="field-street"
                className="h-9.5 rounded-[4px] pl-10"
                name="street"
                placeholder="Rua"
                remove={{ label: true }}
                disabled={isFetching}
                control={form.control}
                icon={
                  <LiaRoadSolid className="absolute top-2.5 left-3" size={20} />
                }
                onValueChange={(e) => onSetValueField("street", e.target.value)}
              />
              <CustomInput
                id="field-number-address"
                className="h-9.5 rounded-[4px]"
                name="number_address"
                control={form.control}
                remove={{ label: true }}
                placeholder="Número"
                disabled={isFetching}
                checkboxLabel="S/N"
                icon={
                  <AiOutlineHome className="absolute top-2 left-3" size={20} />
                }
                onValueChange={(e) =>
                  onSetValueField("number_address", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col items-start gap-2 min-[770px]:flex-row">
              <CustomInput
                id="field-neighborhood"
                className="h-9.5 rounded-[4px] pl-10"
                name="neighborhood"
                placeholder="Bairro"
                remove={{ label: true }}
                disabled={isFetching}
                control={form.control}
                icon={
                  <BiBuildingHouse
                    className="absolute top-2.5 left-3"
                    size={20}
                  />
                }
                onValueChange={(e) =>
                  onSetValueField("neighborhood", e.target.value)
                }
              />
              <CustomInput
                id="field-complement"
                className="h-9.5 rounded-[4px] pl-10"
                name="complement"
                disabled={isFetching}
                remove={{ label: true }}
                placeholder="Complemento"
                control={form.control}
                icon={
                  <LiaStreetViewSolid
                    className="absolute top-2.5 left-3"
                    size={20}
                  />
                }
                onValueChange={(e) =>
                  onSetValueField("complement", e.target.value)
                }
              />
            </div>
          </motion.div>
        )}
      </div>
    </FormProvider>
  );
});
