import * as Sentry from "@sentry/nextjs";
import { isAxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { connection } from "next/server";
import { withHeaderSSR } from "@/utils/withHeaderSSR";
import { iOffer } from "@/interfaces/offer";
import { PixPaymentPage } from "@/models/pix";
import { apiInternal } from "@/services/axios";
import { PixelConfig } from "@/shared/pixels/configs";

export const getServerSideProps = withHeaderSSR(
  async (context: GetServerSidePropsContext) => {
    const { query } = context;

    if (!query || !query.offerUuid) {
      return {
        notFound: true,
      };
    }

    try {
      await connection();

      const res = await apiInternal.get(`/offers/${query.offerUuid}`, {
        timeout: 10000,
      });

      return {
        props: {
          offer: res.data,
          nonce: context.req.headers["x-nonce"] ?? "dev",
        },
      };
    } catch (error) {
      Sentry.captureException(error);

      if (isAxiosError(error)) {
        if (error.status !== 500) {
          return { notFound: true };
        }

        return {
          redirect: {
            destination: "/500",
            permanent: false,
          },
        };
      }
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  },
);

interface iPageProps {
  offer: iOffer;
  nonce: string;
}

export default function Page(props: iPageProps) {
  const { offer, nonce } = props;

  const isAlternativeName =
    offer?.customizations?.alternative_name === "true" &&
    Boolean(offer?.customizations?.alternative_name);

  return (
    <>
      <Head>
        {offer && (
          <>
            <link
              rel="icon"
              nonce={nonce}
              href={offer?.checkout?.favicon ?? "/fav-b4y.png"}
            />
            <title>
              {isAlternativeName
                ? offer.customizations.alternative_name
                : offer.product?.name}{" "}
              | PIX
            </title>
          </>
        )}
      </Head>
      <PixPaymentPage offerData={offer} />
      {offer && <PixelConfig pixels={offer.pixels} nonce={nonce} />}
    </>
  );
}
