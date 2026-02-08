import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { encryptData } from "@/utils/encrypt";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { apiExternal } from "@/services/axios";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (handleOptions(req, res)) return;

    if (env.NEXT_PUBLIC_NODE_ENV === "production") {
      const ipHeader = req.headers["x-forwarded-for"];
      const ip = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader ?? "unknown");

      if (!checkRateLimit(ip)) {
        return new Response("Too many requests", { status: 429 });
      }
    }

    const { offer_uuid, sale_item_id } = req.query;

    if (!sale_item_id) {
      return res.status(400).json({
        message: "sale_item_id is required",
      });
    }

    const response = await apiExternal.get(
      `/upsell-native/${offer_uuid}`,
      {
        headers: {
          host: req.headers.host,
          origin: req.headers.origin,
          referer: req.headers.referer,
          cookie: req.headers.cookie,
          "user-agent": req.headers["user-agent"],
        },
        params: {
          sale_item_id,
        },
      }
    );

    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      return res
        .status(error.response?.status ?? 500)
        .json(error.response?.data);
    }
    throw error;
  }
});
