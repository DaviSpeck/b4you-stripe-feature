import { IncomingHttpHeaders } from "http";
import * as Sentry from "@sentry/nextjs";
import Head from "next/head";
import { withHeaderSSR } from "@/utils/withHeaderSSR";
import { iOffer } from "@/interfaces/offer";
import { UpsellNativePage } from "@/models/upsell-native";
import { apiExternal } from "@/services/axios";

interface iPageProps {
  offer: iOffer;
  nonce: string;
}

export const getServerSideProps = withHeaderSSR<
  { offer: iOffer },
  { offer_id: string; sale_item_id: string }
>(async (context) => {
  const { offer_id, sale_item_id } = context.params as {
    offer_id: string;
    sale_item_id: string;
  };

  if (!offer_id || !sale_item_id) {
    return { notFound: true };
  }

  try {
    const headers = context.req.headers as IncomingHttpHeaders;

    const response = await apiExternal.get<iOffer>(`/offers/${offer_id}`, {
      headers: {
        host: headers.host,
        origin: headers.origin,
        referer: headers.referer,
        cookie: headers.cookie,
      },
      params: {
        ...(context.query.b4f && { b4f: context.query.b4f }),
      },
    });

    return {
      props: {
        offer: response.data,
        nonce:
          (headers["x-nonce"] as string) ??
          (headers["x-csp-nonce"] as string) ??
          "dev",
      },
    };
  } catch (error) {
    Sentry.captureException(error);

    return {
      redirect: {
        destination: `/payment-thanks/${sale_item_id}`,
        permanent: false,
      },
    };
  }
});

export default function Page(props: iPageProps) {
  const { offer } = props;

  return (
    <>
      <Head>
        <link
          rel="icon"
          href={offer.checkout?.favicon ?? "/fav-b4y.png"}
        />
        <title>Oferta Especial</title>
      </Head>

      <UpsellNativePage />
    </>
  );
}