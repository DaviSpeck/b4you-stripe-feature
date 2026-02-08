import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { apiExternal } from "@/services/axios";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (handleOptions(req, res)) return;

  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    const ipHeader = req.headers["x-forwarded-for"];
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader ?? "unknown");

    if (!checkRateLimit(ip)) {
      return new Response("Too many requests", { status: 429 });
    }
  }

  if (req.method !== "POST") {
    return res.status(404).end();
  }

  try {
    const response = await apiExternal.post(
      `/offers/coupon-first-buy/validate/${req.query.productId}`,
      decryptData(req.body),
    );
    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      return res
        .status(error.response?.status ?? 500)
        .json((error.response?.data ?? { sale_id: "" }) as { sale_id: string });
    }
    return res.status(500).json({ sale_id: "" });
  }
});