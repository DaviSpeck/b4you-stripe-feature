import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { env } from "@/env";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";

const Turnstile = dynamic(() => import("react-turnstile"), {
  ssr: false,
});

interface TurnstileProps {
  isOpen: boolean;
}

export function TurnstileComponent({ isOpen }: TurnstileProps) {
  const { offerData } = useOfferData();
  const siteKey = offerData?.site_key;
  const hasResolved = useRef(false);
  const lastSiteKeyRef = useRef<string | null>(null);

  const { resolveCaptcha, expireCaptcha } = useOfferPayment();

  useEffect(() => {
    if (!isOpen) return;
    hasResolved.current = false;
  }, [isOpen, siteKey]);

  useEffect(() => {
    if (!isOpen) {
      lastSiteKeyRef.current = siteKey ?? null;
      return;
    }

    if (!siteKey) {
      expireCaptcha();
      return;
    }

    if (lastSiteKeyRef.current && lastSiteKeyRef.current !== siteKey) {
      expireCaptcha({ keepOpen: true });
    }

    lastSiteKeyRef.current = siteKey;
  }, [isOpen, siteKey, expireCaptcha]);

  // DEV bypass
  useEffect(() => {
    if (
      env.NEXT_PUBLIC_NODE_ENV === "dev" &&
      isOpen &&
      !hasResolved.current
    ) {
      hasResolved.current = true;
      resolveCaptcha("mock-token-localhost");
    }
  }, [isOpen, resolveCaptcha]);

  if (!isOpen || !siteKey) return null;
  if (env.NEXT_PUBLIC_NODE_ENV === "dev") return null;

  return (
    <Turnstile
      sitekey={siteKey}
      theme="light"
      size="normal"
      retryInterval={1000}
      refreshExpired="auto"
      onSuccess={(token) => {
        if (hasResolved.current) return;

        hasResolved.current = true;
        resolveCaptcha(token);
      }}
      onExpire={() => {
        hasResolved.current = false;
        expireCaptcha({ keepOpen: true });
      }}
      onError={() => {
        toast.error(
          "Não foi possível validar o desafio de segurança. Recarregue a página ou tente novamente."
        );
        hasResolved.current = false;
        expireCaptcha({ keepOpen: true });
      }}
    />
  );
}
