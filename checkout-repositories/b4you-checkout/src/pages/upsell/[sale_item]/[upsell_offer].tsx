import * as Sentry from "@sentry/nextjs";
import { isAxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { withHeaderSSR } from "@/utils/withHeaderSSR";
import { env } from "@/env";
import { iOffer } from "@/interfaces/offer";
import { UpsellPage } from "@/models/upsell";

export const getServerSideProps = withHeaderSSR(
  async (context: GetServerSidePropsContext) => {
    const { query } = context;

    if (!Boolean(query.upsell_offer)) {
      return {
        notFound: true,
      };
    }

    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/checkout/offers/${query.upsell_offer}`,
      );

      const data = await response.json();

      return { props: { offer: data } };
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
}

export default function Page(props: iPageProps) {
  const { offer } = props;

  return (
    <>
      <UpsellPage offer={offer} />
    </>
  );
}
