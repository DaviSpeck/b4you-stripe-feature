import { NextApiRequest, NextApiResponse } from "next";

const resolveFlagEndpoint = () => {
  const explicit = process.env.BACKOFFICE_FEATURE_FLAG_URL;
  if (explicit) return explicit;

  const base = process.env.BACKOFFICE_BASE_URL;
  if (!base) return null;

  return `${base.replace(/\/$/, "")}/feature-flags/stripe`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      enabled: false,
      source: "fail-safe",
      reason: "method_not_allowed",
    });
  }

  const endpoint = resolveFlagEndpoint();

  if (!endpoint) {
    return res.status(200).json({
      enabled: false,
      source: "fail-safe",
      reason: "backoffice_unavailable",
    });
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(200).json({
        enabled: false,
        source: "fail-safe",
        reason: "backoffice_unavailable",
      });
    }

    const data = (await response.json()) as { enabled?: unknown };

    if (typeof data?.enabled !== "boolean") {
      return res.status(200).json({
        enabled: false,
        source: "fail-safe",
        reason: "flag_inconsistent",
      });
    }

    return res.status(200).json({
      enabled: data.enabled,
      source: "backoffice",
    });
  } catch (error) {
    return res.status(200).json({
      enabled: false,
      source: "fail-safe",
      reason: "backoffice_unavailable",
    });
  }
}
