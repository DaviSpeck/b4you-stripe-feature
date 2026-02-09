import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import Link from "next/link";
import { apiExternal, apiInternal } from "@/services/axios";
import { iOffer } from "@/interfaces/offer";
import { PaymentStatus, statusConfig } from "./status";

const fallbackCurrency = "usd";

type FeatureFlagResponse = {
  enabled: boolean;
  reason?: string;
  source?: string;
};

type PaymentContext = {
  transaction_id: string;
  order_id: string;
  sale_id: string;
};

type PaymentIntentResponse = {
  transaction_id: string;
  order_id: string;
  sale_id: string;
  provider: "stripe";
  provider_payment_intent_id?: string;
  status: PaymentStatus;
  idempotent?: boolean;
};

interface InternationalCheckoutProps {
  offer: iOffer;
}

export function InternationalCheckout({ offer }: InternationalCheckoutProps) {
  const [featureFlag, setFeatureFlag] = useState<FeatureFlagResponse | null>(
    null,
  );
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    document_number: "",
  });
  const paymentContextRef = useRef<PaymentContext | null>(null);

  const price = useMemo(() => offer.price ?? 0, [offer]);
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: fallbackCurrency.toUpperCase(),
    }).format(price);
  }, [price]);

  const canSubmit =
    !submitting &&
    featureFlag?.enabled &&
    Boolean(offer?.product?.id) &&
    Boolean(offer?.id_user) &&
    Boolean(offer?.brand) &&
    Boolean(
      customer.full_name &&
        customer.email &&
        customer.whatsapp &&
        customer.document_number,
    );

  useEffect(() => {
    let isMounted = true;

    const fetchFeatureFlag = async () => {
      try {
        const response = await apiInternal.get<FeatureFlagResponse>(
          "/feature-flags/stripe",
        );
        if (isMounted) {
          setFeatureFlag(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setFeatureFlag({
            enabled: false,
            reason: "feature_flag_unavailable",
            source: "fail-safe",
          });
        }
      }
    };

    fetchFeatureFlag();

    return () => {
      isMounted = false;
    };
  }, []);

  const buildPaymentContext = () => {
    if (!paymentContextRef.current) {
      paymentContextRef.current = {
        transaction_id: uuid(),
        order_id: uuid(),
        sale_id: uuid(),
      };
    }

    return paymentContextRef.current;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (status === "pending") {
      setError("Payment is already pending. Please wait for confirmation.");
      return;
    }

    if (!offer.id_user || !offer.brand) {
      setError("International checkout is unavailable for this offer.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { transaction_id, order_id, sale_id } = buildPaymentContext();

    const payload = {
      transaction_id,
      order_id,
      sale_id,
      amount: Math.round(price * 100),
      currency: fallbackCurrency,
      payment_method_types: ["card"],
      id_user: offer.id_user,
      brand: offer.brand,
      installments: 1,
      student_pays_interest: false,
      discount: 0,
      coupon: null,
      customer: {
        full_name: customer.full_name,
        email: customer.email,
        whatsapp: customer.whatsapp,
        document_number: customer.document_number,
        address: null,
        params: null,
      },
      items: [
        {
          id_product: offer.product.id,
          type: "main",
          price: Math.round(price * 100),
          quantity: 1,
          id_offer: null,
          id_classroom: null,
          id_affiliate: null,
          subscription_fee: 0,
          shipping_price: 0,
          integration_shipping_company: null,
          is_upsell: false,
          warranty: offer.product.warranty ?? null,
        },
      ],
    };

    try {
      const response = await apiExternal.post<PaymentIntentResponse>(
        "/international/payments/stripe/payment-intents",
        payload,
      );
      const result = response.data;
      setStatus(result.status);
      sessionStorage.setItem(
        "international-payment-context",
        JSON.stringify({
          transaction_id: result.transaction_id,
          order_id: result.order_id,
          sale_id: result.sale_id,
          provider: result.provider,
        }),
      );
    } catch (err) {
      setStatus("failed");
      setError(
        "We could not create your payment. You can retry without creating a new transaction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = status ? statusConfig[status] : null;
  const saleId = paymentContextRef.current?.sale_id ?? null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 text-[#0f1b35]">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-[#6c757d]">
          International checkout
        </p>
        <h1 className="text-2xl font-semibold">Complete your purchase</h1>
        <p className="text-sm text-[#6c757d]">
          Pay securely using the internal B4You checkout flow.
        </p>
      </header>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase text-[#6c757d]">Product</span>
          <span className="text-lg font-medium">{offer.product.name}</span>
          <span className="text-sm text-[#6c757d]">{formattedPrice}</span>
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Customer details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Full name
              <input
                id="field-full-name"
                className="rounded-md border border-[#d1d5db] px-3 py-2"
                value={customer.full_name}
                onChange={(event) =>
                  setCustomer((prev) => ({
                    ...prev,
                    full_name: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Email
              <input
                id="field-email"
                type="email"
                className="rounded-md border border-[#d1d5db] px-3 py-2"
                value={customer.email}
                onChange={(event) =>
                  setCustomer((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Phone
              <input
                id="field-phone"
                className="rounded-md border border-[#d1d5db] px-3 py-2"
                value={customer.whatsapp}
                onChange={(event) =>
                  setCustomer((prev) => ({
                    ...prev,
                    whatsapp: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Document
              <input
                id="field-document"
                className="rounded-md border border-[#d1d5db] px-3 py-2"
                value={customer.document_number}
                onChange={(event) =>
                  setCustomer((prev) => ({
                    ...prev,
                    document_number: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Payment status</h2>
          {!statusInfo && (
            <p className="text-sm text-[#6c757d]">
              Submit the payment to generate a pending status.
            </p>
          )}
          {statusInfo && (
            <div className="rounded-md bg-[#f8fafc] p-4">
              <p className="text-base font-semibold">{statusInfo.title}</p>
              <p className="text-sm text-[#6c757d]">{statusInfo.description}</p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!featureFlag?.enabled && (
            <p className="text-sm text-red-600">
              International checkout is unavailable. {featureFlag?.reason ?? ""}
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="rounded-md bg-[#0f1b35] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? "Processing..." : "Pay now"}
        </button>
        {status === "pending" && saleId && (
          <Link
            href={`/international/thank-you/${saleId}`}
            className="text-sm font-medium text-[#0f1b35] underline"
          >
            Go to confirmation
          </Link>
        )}
      </div>
    </main>
  );
}
