import { GetServerSidePropsContext } from "next";

export function getBaseUrlFromReq(req: GetServerSidePropsContext["req"]) {
    const host = req.headers.host;
    if (!host) {
        throw new Error("Host header not found");
    }

    const proto =
        (req.headers["x-forwarded-proto"] as string) ??
        "http";

    return `${proto}://${host}`;
}