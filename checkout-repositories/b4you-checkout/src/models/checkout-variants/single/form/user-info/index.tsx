import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching } from "@tanstack/react-query";
import { cnpj, cpf } from "cpf-cnpj-validator";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AiOutlineMail, AiOutlineUser } from "react-icons/ai";
import { LiaAddressCardSolid, LiaWhatsapp } from "react-icons/lia";
import { z } from "zod";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { CustomInput } from "@/components/custom-inputs-form";
import { useOfferData } from "@/hooks/states/useOfferData";
import { queryClient } from "@/pages/_app";
import { iAbandonedCartResponse } from "@/pages/api/cart/find/[cartId]";
import { FormaterCpf, FormaterPhone } from "@/shared/formaters";
import { FormaterCnpj } from "@/shared/formaters/cnpj";
import { normalizePhone } from "@/shared/formaters/phone";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { useCheckoutStorage } from "../storage";
import { FormUserInfoValidation } from "./_schema";

type formType = z.infer<typeof FormUserInfoValidation>;

export const UserInfo = forwardRef<{ execute: () => void }>((_, ref) => {
  const [searchParams, setSearchParams] = useQueryStates({
    full_name: parseAsString.withDefault(""),
    document: parseAsString.withDefault(""),
    whatsapp: parseAsString.withDefault(""),
    email: parseAsString.withDefault(""),
    phone: parseAsString.withDefault(""),
    cartId: parseAsString.withDefault(""),
    step: parseAsString.withDefault(""),
  });

  const isFetching = Boolean(useIsFetching());

  const oldCardDataCache = queryClient.getQueryData([
    "old-cart",
    searchParams.cartId,
  ]) as iAbandonedCartResponse;

  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const hasStartedRef = useRef(false);
  const hasFilledRef = useRef(false);
  const lastSubmitCountRef = useRef(0);

  const form = useForm<formType>({
    mode: "onChange",
    resolver: zodResolver(FormUserInfoValidation),
    defaultValues: {
      full_name: searchParams.full_name,
      email: searchParams.email,
      whatsapp: normalizePhone(
        searchParams.whatsapp || searchParams.phone,
      ),
      document_number: cnpj.isValid(searchParams.document.replace(/\D/g, ""))
        ? FormaterCnpj(searchParams.document.replace(/\D/g, ""))
        : FormaterCpf(searchParams.document),
      isCnpj: cnpj.isValid(searchParams.document.replace(/\D/g, "")),
    },
  });

  const onSetValueField = (name: keyof formType, value: string) => {
    localStorage.setItem(
      "user-info-data",
      encryptData({ ...form.getValues(), [name]: value }).encrypted,
    );
  };

  const onSubmit = (data: formType) => {
    useCheckoutStorage.setState({ userInfo: data, userInfoError: false });
    trackEvent("checkout_identification_completed", {
      step: "identification",
      email: data.email,
      phone: data.whatsapp,
    });
  };

  useImperativeHandle(ref, () => ({
    execute: form.handleSubmit(onSubmit),
  }));

  // Adiciona dados do carrinho abandonado
  useEffect(() => {
    if (!Boolean(oldCardDataCache)) return;

    form.setValue(
      "full_name",
      oldCardDataCache.full_name ?? searchParams.full_name,
      { shouldValidate: true },
    );

    form.setValue(
      "whatsapp",
      normalizePhone(oldCardDataCache.whatsapp ?? searchParams.whatsapp),
      { shouldValidate: true },
    );

    form.setValue("email", oldCardDataCache.email ?? searchParams.email, {
      shouldValidate: true,
    });

    let document_number: string = "";
    let isCnpj: boolean = false;

    if (cnpj.isValid(FormaterCnpj(searchParams.document))) {
      document_number = FormaterCnpj(searchParams.document);
      isCnpj = true;
    }

    if (cpf.isValid(FormaterCpf(searchParams.document))) {
      document_number = FormaterCpf(searchParams.document);
      isCnpj = false;
    }

    form.setValue("document_number", document_number, { shouldValidate: true });
    form.setValue("isCnpj", isCnpj, { shouldValidate: true });
  }, [oldCardDataCache]);

  // Verifica e adiciona documento de acordo com o tipo
  useEffect(() => {
    if (!Boolean(searchParams.document)) return;

    if (cnpj.isValid(FormaterCnpj(searchParams.document))) {
      form.setValue("document_number", FormaterCnpj(searchParams.document));
      form.setValue("isCnpj", true);
    }

    if (cpf.isValid(FormaterCpf(searchParams.document))) {
      form.setValue("document_number", FormaterCpf(searchParams.document));
      form.setValue("isCnpj", false);
    }
  }, []);

  useEffect(() => {
    form.clearErrors();
    form.setFocus("full_name");
    form.trigger("full_name");
  }, [form.formState.isReady]);

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

  // guarda dados informados pelo usuário
  useEffect(() => {
    if (searchParams.step) return;

    const encryptedUserInfo = localStorage.getItem("user-info-data");

    if (!encryptedUserInfo) return;

    const userInfoDecrypted = decryptData({
      encrypted: encryptedUserInfo,
    }) as formType;

    Object.entries(userInfoDecrypted).forEach(([key, value]) => {
      if (key !== "whatsapp" && key !== "zipcode") {
        form.setValue(key as keyof formType, value);
      }

      if (key === "whatsapp") {
        form.setValue("whatsapp", normalizePhone(value as string));
      }
    });

    setSearchParams({ document: userInfoDecrypted.document_number });
  }, []);

  return (
    <>
      <FormProvider {...form}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-start gap-2 min-[770px]:flex-row">
            <CustomInput
              id="field-full-name"
              className="h-9.5 w-full rounded-[4px] pl-10"
              name="full_name"
              disabled={isFetching}
              placeholder="Digite seu nome completo"
              control={form.control}
              remove={{
                label: true,
              }}
              icon={
                <AiOutlineUser className="absolute top-2.5 left-3" size={20} />
              }
              type="text"
              formater={(value) => value.replace(/[^\p{L} ]/gu, "")}
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
              onBlur={(e) => {
                if (Boolean(e.target.value)) {
                  form.trigger("email");
                  form.trigger("document_number");
                  form.trigger("whatsapp");
                }
              }}
            />
            <CustomInput
              id="field-email"
              className="h-9.5 w-full rounded-[4px] pl-10"
              name="email"
              disabled={isFetching}
              placeholder="Digite seu email"
              control={form.control}
              remove={{
                label: true,
              }}
              onValueChange={(e) => onSetValueField("email", e.target.value)}
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_identification_started", {
                  step: "identification",
                });
              }}
              icon={
                <AiOutlineMail className="absolute top-2.5 left-3" size={19} />
              }
            />
          </div>
          <div className="flex flex-col items-start gap-2 min-[770px]:flex-row">
            <CustomInput
              id="field-document"
              className="h-9.5 rounded-[4px] pl-10"
              name="document_number"
              disabled={isFetching}
              placeholder={form.watch("isCnpj") ? "CNPJ" : "CPF"}
              control={form.control}
              formater={form.watch("isCnpj") ? FormaterCnpj : FormaterCpf}
              checkValue={form.watch("isCnpj")}
              checkboxPosition="in"
              checkboxLabel="CNPJ"
              isSingleCheckout
              remove={{
                label: true,
              }}
              onValueChange={(e) => {
                onSetValueField(
                  "document_number",
                  form.getValues("isCnpj")
                    ? FormaterCnpj(e.target.value)
                    : FormaterCpf(e.target.value),
                );
                setSearchParams({
                  document: e.target.value.replace(/[^\d]/g, ""),
                });
              }}
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_identification_started", {
                  step: "identification",
                });
              }}
              onCheckChenge={(value) => {
                form.setValue("isCnpj", value);
                form.setValue("document_number", "", { shouldValidate: true });
              }}
              icon={
                <LiaAddressCardSolid
                  className="absolute top-2.5 left-3"
                  size={20}
                />
              }
            />
            <CustomInput
              id="field-phone"
              className="h-[38px] rounded-[4px] pl-10"
              name="whatsapp"
              disabled={isFetching}
              remove={{
                label: true,
              }}
              placeholder="WhatsApp"
              control={form.control}
              onValueChange={(e) => onSetValueField("whatsapp", e.target.value)}
              onFocus={() => {
                if (hasStartedRef.current) return;
                hasStartedRef.current = true;
                trackEvent("checkout_identification_started", {
                  step: "identification",
                });
              }}
              icon={
                <LiaWhatsapp className="absolute top-2.5 left-3" size={20} />
              }
              formater={FormaterPhone}
            />
          </div>
        </div>
      </FormProvider>
    </>
  );
});
