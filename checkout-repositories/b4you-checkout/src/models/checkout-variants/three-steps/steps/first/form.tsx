import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaArrowRightLong } from "react-icons/fa6";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { fecthMutation, fecthRead } from "@/utils/fetch";
import { CustomInput } from "@/components/custom-inputs-form";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iAbandonedCartResponse } from "@/pages/api/cart/find/[cartId]";
import { iCartInitiateBody } from "@/pages/api/cart/initiate-cart";
import { FormaterPhone } from "@/shared/formaters";
import { normalizePhone } from "@/shared/formaters/phone";
import { userDataStore } from "@/shared/user-data-store";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formUserDataFirstStepSchema } from "./form-schema";
import { iFormDataFistStep } from "./interface";

export function FormFirsStep() {
  const [searchParams, setSearchParams] = useQueryStates({
    step: parseAsString.withDefault(""),
    cartId: parseAsString.withDefault(""),
    full_name: parseAsString.withDefault(""),
    email: parseAsString.withDefault(""),
    whatsapp: parseAsString.withDefault(""),
    document: parseAsString.withDefault(""),
    isCnpj: parseAsBoolean.withDefault(false),
    src: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const { offerData } = useOfferData();
  const { firstStepFormData, set, stepSubmit } = useOfferCheckoutSteps();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const hasStartedRef = useRef(false);
  const hasFilledRef = useRef(false);
  const lastSubmitCountRef = useRef(0);

  const form = useForm<iFormDataFistStep>({
    resolver: zodResolver(formUserDataFirstStepSchema),
    mode: "onChange",
    defaultValues: {
      full_name: firstStepFormData?.full_name ?? searchParams.full_name,
      email: firstStepFormData?.email ?? searchParams.email,
      whatsapp: firstStepFormData?.whatsapp
        ? normalizePhone(firstStepFormData?.whatsapp)
        : normalizePhone(searchParams.whatsapp),
    },
  });

  // CARRINHO ABANDONADO
  const { mutate } = fecthMutation<unknown, iCartInitiateBody>({
    method: "post",
    route: "/cart/initiate-cart",
    options: {
      mutationKey: ["cart-initiate"],
    },
  });

  const handlerInitiateCart = (data: iFormDataFistStep) => {
    mutate({
      offer_uuid: offerData!.uuid,
      full_name: data.full_name,
      email: data.email,
      whatsapp: data.whatsapp,
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

  // BUSCA OS DADOS DO CARRINHO ABANDONADO
  const { data: oldCartData, isFetching: isLoadingOldCart } =
    fecthRead<iAbandonedCartResponse>({
      queryKey: ["old-cart", searchParams.cartId],
      route: `/cart/find/${searchParams.cartId}`,
      options: {
        enabled: Boolean(searchParams.cartId),
        staleTime: Infinity,
      },
    });

  const onSubmit: SubmitHandler<iFormDataFistStep> = (data) => {
    stepSubmit({
      hasFrenet: offerData?.has_frenet ? true : false,
      isRequiredAddress: offerData?.require_address ?? true,
    });
    set({
      firstStepFormData: data,
    });
    handlerInitiateCart(data);
    userDataStore(data);
    trackEvent("checkout_identification_completed", {
      step: "identification",
      email: data.email,
      phone: data.whatsapp,
    });
  };

  const onSetValueField = (name: keyof iFormDataFistStep, value: string) => {
    localStorage.setItem(
      "user-info-data",
      encryptData({ ...form.getValues(), [name]: value }).encrypted,
    );
  };

  useEffect(() => {
    form.trigger("full_name");
    form.setFocus("full_name");

    if (!firstStepFormData) {
      const data = userDataStore();

      form.setValue("full_name", data.full_name, { shouldValidate: true });
      form.setValue("email", data.email, { shouldValidate: true });
      form.setValue("whatsapp", data.whatsapp, { shouldValidate: true });
    }
  }, []);

  useEffect(() => {
    if (
      form.formState.isValid &&
      (form.formState.isDirty || form.formState.isSubmitted) &&
      !hasFilledRef.current
    ) {
      const values = form.getValues();
      trackEvent("checkout_identification_filled", {
        step: "identification",
        email: values.email,
        phone: values.whatsapp,
      });
      hasFilledRef.current = true;
    }
  }, [
    form.formState.isValid,
    form.formState.isDirty,
    form.formState.isSubmitted,
    trackEvent,
    form,
  ]);

  useEffect(() => {
    const submitCount = form.formState.submitCount;
    if (submitCount === lastSubmitCountRef.current) return;
    lastSubmitCountRef.current = submitCount;

    if (!form.formState.isValid) {
      const values = form.getValues();
      trackEvent("checkout_identification_error", {
        step: "identification",
        email: values.email,
        phone: values.whatsapp,
      });
    }
  }, [form.formState.submitCount, form.formState.isValid, trackEvent, form]);

  // DADOS DO CARRINHO ABANDONADO
  useEffect(() => {
    if (!Boolean(searchParams.cartId)) return;
    if (!oldCartData) return;

    const infoData = {
      full_name: oldCartData.full_name ?? "",
      email: oldCartData.email ?? "",
      whatsapp: FormaterPhone(
        String(oldCartData.whatsapp ?? "").replace(/\D+/g, ""),
      ),
    };

    Object.entries(infoData).forEach(([key, value]) =>
      form.setValue(key as keyof iFormDataFistStep, value as string, {
        shouldValidate: true,
      }),
    );

    const { success } = formUserDataFirstStepSchema.safeParse(infoData);

    if (!success) return;

    set({
      firstStepFormData: infoData,
      currentStep: offerData?.require_address ? "two" : "three",
    });
  }, [oldCartData]);

  // GURDA DADOS INFORMADO PELO USUÁRIO
  useEffect(() => {
    if (searchParams.step) return;

    const encryptedUserInfo = localStorage.getItem("user-info-data");

    if (!encryptedUserInfo) return;

    const userInfoDecrypted = decryptData({
      encrypted: encryptedUserInfo,
    }) as iFormDataFistStep & { document_number: string };

    Object.entries(userInfoDecrypted).forEach(([key, value]) =>
      form.setValue(key as keyof iFormDataFistStep, value, {
        shouldValidate: true,
      }),
    );

    setSearchParams({ document: userInfoDecrypted.document_number });
  }, []);

  //VALIDA DADOS DE INTEGRAÇÃO COM A PAYLOG (FREESENDER)
  useEffect(() => {
    if (!Boolean(searchParams.step)) return;

    const infoData = {
      full_name: searchParams.full_name ?? "",
      email: searchParams.email ?? "",
      whatsapp: FormaterPhone(
        String(searchParams.whatsapp ?? "").replace(/\D+/g, ""),
      ),
    };

    Object.entries(infoData).forEach(([key, value]) =>
      form.setValue(key as keyof iFormDataFistStep, value as string, {
        shouldValidate: true,
      }),
    );

    const { success } = formUserDataFirstStepSchema.safeParse(infoData);

    if (!success) return;

    set({
      firstStepFormData: infoData,
      currentStep: offerData?.require_address ? "two" : "three",
    });
  }, [searchParams.step]);

  return (
    <>
      {isLoadingOldCart && <FormFirsStep.Loading />}
      <Form {...form}>
        <form
          id="form-first-step"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-6"
        >
          <div className="flex flex-col gap-4">
            <CustomInput
              id="field-full-name"
              label="Nome completo"
              name="full_name"
              placeholder="Digite o seu nome completo"
              control={form.control}
              formater={(value) => value.replace(/[^\p{L} ]/gu, "")}
              onBlur={(e) => Boolean(e.target.value) && form.trigger()}
              onValueChange={(e) =>
                onSetValueField("full_name", e.target.value)
              }
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_identification_started", {
                  step: "identification",
                });
              }}
            />
            <CustomInput
              id="field-email"
              label="Email"
              name="email"
              placeholder="Digite seu e-mail"
              control={form.control}
              onValueChange={(e) => onSetValueField("email", e.target.value)}
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_identification_started", {
                  step: "identification",
                });
              }}
            />
            <CustomInput
              id="field-phone"
              label="Celular / WhatsApp"
              name="whatsapp"
              placeholder="WhatsApp"
              control={form.control}
              formater={FormaterPhone}
              onValueChange={(e) =>
                onSetValueField("whatsapp", FormaterPhone(e.target.value))
              }
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_identification_started", {
                  step: "identification",
                });
              }}
            />
          </div>
          <div className="flex flex-col">
            <Button
              id="first-step-btn-submit"
              className="h-[50px] cursor-pointer bg-[#20c374] hover:bg-[#20c374]"
            >
              Continuar
              <FaArrowRightLong size={20} />
            </Button>
            {!form.formState.isValid && form.formState.isSubmitted && (
              <span
                id="first-step-message-filds-error"
                className="py-1.5 text-center text-[0.75rem] text-red-500"
              >
                Preencha todos os campos corretamente.
              </span>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}

FormFirsStep.Loading = function () {
  return (
    <motion.div
      className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center rounded-[10px] bg-[#00000014]"
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AiOutlineLoading3Quarters size={30} className="animate-spin" />
    </motion.div>
  );
};
