import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IoCheckmark } from "react-icons/io5";
import { LiaCheckCircle } from "react-icons/lia";
import { iSaleData } from "@/interfaces/sale-data";
import { cn } from "@/shared/libs/cn";
import { PaymentStatus, statusConfig } from "@/models/international-checkout/status";

interface InternationalThanksProps {
  saleData: iSaleData;
}

type StoredContext = {
  transaction_id: string;
  order_id: string;
  sale_id: string;
  provider: string;
};

const resolveStatus = (saleData: iSaleData): PaymentStatus => {
  const status = saleData.products?.[0]?.payment?.status;
  if (status === "approved" || status === "failed" || status === "refunded" || status === "dispute") {
    return status;
  }
  return "pending";
};

export function InternationalThanks({ saleData }: InternationalThanksProps) {
  const searchParams = useSearchParams();
  const [context, setContext] = useState<StoredContext | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("international-payment-context");
    if (!raw) return;
    try {
      setContext(JSON.parse(raw));
    } catch (err) {
      setContext(null);
    }
  }, []);

  const resolvedStatus = useMemo(() => {
    const override = searchParams?.get("status") as PaymentStatus | null;
    if (override && typeof window !== "undefined" && "Cypress" in window) {
      return override;
    }
    return resolveStatus(saleData);
  }, [saleData, searchParams]);

  const statusInfo = statusConfig[resolvedStatus];
  const primaryTitle = saleData.products[0]?.name ?? "your purchase";
  const studentEmail = saleData.student?.email ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f6f6] px-4 py-8 max-[560px]:bg-[#fff]">
      <div className="flex w-full max-w-[520px] flex-col justify-center gap-6 bg-[#fff] p-8 shadow-lg max-[560px]:shadow-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <LiaCheckCircle size={80} />
          <h1 className="text-[1.5rem] font-medium text-[#0f1b35]">
            {statusInfo.title}
          </h1>
          <p className="text-[1rem] font-normal text-[#0f1b35]">
            {statusInfo.description}
          </p>
          <p className="text-[0.95rem] text-[#6c757d]">
            Product: <span className="font-semibold">{primaryTitle}</span>
          </p>
        </div>

        {saleData.products.length > 1 && (
          <ul className="flex flex-col gap-[1.5px]">
            {saleData.products.map((product, i) => (
              <InternationalThanks.Product
                key={product.uuid}
                data={product}
                index={i}
                lastIndex={saleData.products.length - 1}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-4 text-center">
          <p className="text-[0.775rem] text-[#6c757d]">
            We sent an email to <span className="font-semibold">{studentEmail}</span>
            {" "}with the transaction summary.
          </p>
          <p className="text-[0.775rem] text-[#6c757d]">
            If you can’t find it, please check your spam or junk folder.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-md bg-[#f8fafc] p-3 text-[0.75rem] text-[#6c757d]">
          <span>Sale UUID: {saleData.uuid}</span>
          {context && (
            <>
              <span>Transaction ID: {context.transaction_id}</span>
              <span>Order ID: {context.order_id}</span>
              <span>Provider: {context.provider}</span>
            </>
          )}
        </div>
      </div>

      <Image
        className="mt-[15px] mb-[15px] opacity-60 grayscale"
        src="/logo-horizontal.png"
        alt="B4You"
        width={150}
        height={40}
      />
    </main>
  );
}

interface iProductProps {
  index: number;
  lastIndex: number;
  data: iSaleData["products"][0];
}

InternationalThanks.Product = function ProductItem(props: iProductProps) {
  const { data, index, lastIndex } = props;

  const title = data.name ?? data.offer?.name;
  const subtitle = data.is_upsell
    ? "Upsell"
    : data.plan?.label ?? null;

  return (
    <li
      className={cn(
        "flex items-start gap-2 bg-gray-100 p-2 px-3 text-[0.85rem]",
        index === 0 && "rounded-t-[8px]",
        lastIndex === index && "rounded-b-[8px]",
      )}
    >
      <IoCheckmark className="mt-[2px] text-green-500" size={18} />

      <div className="flex flex-col leading-tight">
        <h1 className="font-normal">{title}</h1>

        {subtitle && <span className="text-[0.7rem] text-gray-500">{subtitle}</span>}
      </div>
    </li>
  );
};
