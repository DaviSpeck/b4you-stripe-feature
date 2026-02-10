import { NextApiRequest, NextApiResponse } from "next";
import { apiExternal } from "@/services/axios";

type StripeFeatureFlagResponse = {
  enabled?: unknown;
  source?: string;
  reason?: string;
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

  try {
    const response = await apiExternal.get<StripeFeatureFlagResponse>(
      "/feature-flags/stripe",
      { timeout: 3000 },
    );

    const data = response.data;

    if (typeof data?.enabled !== "boolean") {
      return res.status(200).json({
        enabled: false,
        source: "fail-safe",
        reason: "flag_inconsistent",
      });
    }

    return res.status(200).json({
      enabled: data.enabled,
      source: data.source ?? "database",
      ...(data.reason ? { reason: data.reason } : {}),
    });
  } catch (error) {
    return res.status(200).json({
      enabled: false,
      source: "fail-safe",
      reason: "backoffice_unavailable",
    });
  }
}
