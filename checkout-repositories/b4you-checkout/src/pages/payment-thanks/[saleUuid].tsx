import * as Sentry from "@sentry/nextjs";
import { isAxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { withHeaderSSR } from "@/utils/withHeaderSSR";
import { iSaleData } from "@/interfaces/sale-data";
import { PageThanks } from "@/models/payment-thanks";
import { apiExternal } from "@/services/axios";

export const getServerSideProps = withHeaderSSR(
  async (context: GetServerSidePropsContext) => {
    const { query } = context;

    const saleUuid =
      typeof query.saleUuid === "string" ? query.saleUuid : null;

    if (!saleUuid) {
      return { notFound: true };
    }

    try {
      const res = await apiExternal.get(`/delivery/${query.saleUuid}`, {
        timeout: 10000,
      });
      return {
        props: { saleData: res.data },
      };
    } catch (error) {
      Sentry.captureException(error);

      if (isAxiosError(error)) {
        const status = error.response?.status ?? 500;

        if (status !== 500) {
          return { notFound: true };
        }
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
  saleData: iSaleData;
}

export default function Page(props: iPageProps) {
  const { saleData } = props;
  return <PageThanks saleData={saleData} />;
}
