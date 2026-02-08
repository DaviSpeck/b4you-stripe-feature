import * as Sentry from "@sentry/nextjs";
import { isAxiosError } from "axios";
import * as cookie from "cookie";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useParams } from "next/navigation";
import { connection } from "next/server";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { getAllowedOrigins, normalizeOrigin } from "@/utils/cors";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { withHeaderSSR } from "@/utils/withHeaderSSR";
import { env } from "@/env";
import { iOffer } from "@/interfaces/offer";
import { SingleCheckoutPage } from "@/models/checkout-variants/single";
import { CheckoutThreeStepsPage } from "@/models/checkout-variants/three-steps";
import { KondutoConfig } from "@/shared/konduto-scrip";
import { PixelConfig } from "@/shared/pixels/configs";

interface iPageProps {
  offer: iOffer;
  nonce: string;
}

export const getServerSideProps = withHeaderSSR<
  { offer: iOffer | null },
  { params: string[] }
>(async (context: GetServerSidePropsContext<{ params: string[] }>) => {
  const [offerId] = context.query.params as string[];
  const ip =
    context.req.headers["x-forwarded-for"] ||
    context.req.socket.remoteAddress ||
    "";

  // ============ RATE LIMIT ========== //
  const allowed = checkRateLimit(ip.toString());

  if (!allowed) {
    context.res.statusCode = 429;
    context.res.setHeader("Content-Type", "application/json");
    context.res.end(JSON.stringify({ error: "Too many requests" }));
    return { props: { offer: null } };
  }
  // =============== CORS ============== //

  if (env.NEXT_PUBLIC_NODE_ENV !== "dev") {
    const allowedOrigins = getAllowedOrigins();
    const origin = context.req.headers.origin as string | undefined;

    if (origin && !allowedOrigins.includes(normalizeOrigin(origin))) {
      context.res.statusCode = 403;
      context.res.setHeader("Content-Type", "application/json");
      context.res.end(JSON.stringify({ error: "Forbidden origin" }));
      return { props: { offer: null } };
    }
  }

  // ================================== //

  if (!offerId) {
    return { notFound: true };
  }

  try {
    await connection();

    const cookieHeader = context.req.headers.cookie ?? "";
    const forwardedProto =
      (context.req.headers["x-forwarded-proto"] as string | undefined) ??
      "https";
    const forwardedHost =
      (context.req.headers["x-forwarded-host"] as string | undefined) ??
      context.req.headers.host;
    const resolvedOrigin =
      (context.req.headers.origin as string | undefined) ??
      (forwardedHost ? `${forwardedProto}://${forwardedHost}` : "");

    const response = await fetch(
      `${env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/checkout/offers/${offerId}` +
      (context.query.b4f ? `?b4f=${context.query.b4f}` : ""),
      {
        credentials: "include",
        headers: {
          Cookie: cookieHeader,
          origin: resolvedOrigin,
          referer: (context.req.headers.referer as string | undefined) ?? "",
          "x-forwarded-host": forwardedHost ?? "",
          "x-forwarded-proto": forwardedProto,
        },
      },
    );

    const data = (await response.json()) as iOffer;

    if (response.status !== 200) {
      return { notFound: true };
    }

    if (data.sixid) {
      const currentSixid = context.req.cookies?.sixid;

      if (currentSixid !== data.sixid) {
        const deleteOld = cookie.serialize("sixid", "", {
          httpOnly: true,
          path: "/",
          maxAge: 0,
          secure: true,
          sameSite: "lax",
        });

        const setNew = cookie.serialize("sixid", data.sixid, {
          httpOnly: true,
          path: "/",
          maxAge: 365 * 24 * 60 * 60, // 1 ano
          secure: true,
          sameSite: "lax",
        });

        context.res.setHeader("Set-Cookie", [deleteOld, setNew]);
      }
    }

    return {
      props: {
        offer: data,
        nonce: context.req.headers["x-nonce"] ?? "dev",
      },
    };
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      if (status < 500) return { notFound: true };

      Sentry.captureException(error);
      return { redirect: { destination: "/500", permanent: false } };
    }

    Sentry.captureException(error);
    return { redirect: { destination: "/500", permanent: false } };
  }
});

export default function Page(props: iPageProps) {
  const { offer, nonce } = props;

  const { params } = useParams<{ params: string[] }>();

  const [_, checkoutType] = params;

  if (!offer) {
    return (
      <div className="flex h-[calc(100vh)] items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  const isAlternativeName =
    offer?.customizations?.alternative_name === "true" &&
    Boolean(offer?.customizations?.alternative_name);

  return (
    <div>
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
                : offer.product?.name}
            </title>
          </>
        )}
      </Head>
      {Boolean(checkoutType) ? (
        <CheckoutThreeStepsPage offer={offer} />
      ) : (
        <SingleCheckoutPage offerData={offer} />
      )}
      {offer && (
        <>
          <PixelConfig nonce={nonce} pixels={offer.pixels} />
          <KondutoConfig
            nonce={nonce}
            productType={
              offer.product.type === "physical" ? "physical" : "digital"
            }
          />
        </>
      )}
    </div>
  );
}
