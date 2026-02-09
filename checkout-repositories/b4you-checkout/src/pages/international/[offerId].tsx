import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiExternal } from "@/services/axios";
import { iOffer } from "@/interfaces/offer";
import { InternationalCheckout } from "@/models/international-checkout";

export default function InternationalCheckoutPage() {
  const params = useParams<{ offerId: string }>();
  const offerId = params?.offerId;
  const [offer, setOffer] = useState<iOffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) return;

    let isMounted = true;

    const fetchOffer = async () => {
      try {
        const response = await apiExternal.get<iOffer>(`/offers/${offerId}`);
        if (isMounted) {
          setOffer(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load the offer. Please try again later.");
        }
      }
    };

    fetchOffer();

    return () => {
      isMounted = false;
    };
  }, [offerId]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 text-center text-sm text-red-600">
        {error}
      </main>
    );
  }

  if (!offer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 text-center text-sm text-[#6c757d]">
        Loading international checkout...
      </main>
    );
  }

  return <InternationalCheckout offer={offer} />;
}
