import { NextApiRequest, NextApiResponse } from "next";

export function handleOptions(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "OPTIONS") return false;

    res.setHeader(
        "Access-Control-Allow-Origin",
        req.headers.origin ?? "*",
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS",
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        req.headers["access-control-request-headers"] ?? "*",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.status(204).end();
    return true;
}