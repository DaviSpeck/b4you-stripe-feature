import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiExternal } from "@/services/axios";
import { iSaleData } from "@/interfaces/sale-data";
import { InternationalThanks } from "@/models/international-thanks";

export default function InternationalThankYouPage() {
  const params = useParams<{ saleUuid: string }>();
  const saleUuid = params?.saleUuid;
  const [saleData, setSaleData] = useState<iSaleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!saleUuid) return;

    let isMounted = true;

    const fetchSale = async () => {
      try {
        const response = await apiExternal.get<iSaleData>(
          `/delivery/${saleUuid}`,
        );
        if (isMounted) {
          setSaleData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load the payment status.");
        }
      }
    };

    fetchSale();

    return () => {
      isMounted = false;
    };
  }, [saleUuid]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 text-center text-sm text-red-600">
        {error}
      </main>
    );
  }

  if (!saleData) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 text-center text-sm text-[#6c757d]">
        Loading payment status...
      </main>
    );
  }

  return <InternationalThanks saleData={saleData} />;
}
