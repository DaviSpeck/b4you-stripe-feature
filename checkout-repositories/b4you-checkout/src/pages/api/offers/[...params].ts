import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { iOffer } from "@/interfaces/offer";
import { apiExternal } from "@/services/axios";

export default apiHandler<iOffer>(
  async (
    req: NextApiRequest,
    res: NextApiResponse<iOffer | { message: string }>,
  ) => {
    if (handleOptions(req, res)) return;

    if (env.NEXT_PUBLIC_NODE_ENV === "production") {
      const ipHeader = req.headers["x-forwarded-for"];
      const ip = Array.isArray(ipHeader)
        ? ipHeader[0]
        : (ipHeader ?? "unknown");

      if (!checkRateLimit(ip)) {
        return new Response("Too many requests", { status: 429 });
      }
    }

    const { params }: Partial<{ params: string[] }> = req.query;
    const path = params?.join("/") ?? "";

    try {
      const response = await apiExternal.get<iOffer>(`/offers/${path}`);
      return res.status(response.status).json(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        return res
          .status(error.response?.status ?? 500)
          .json(error.response?.data as iOffer);
      }
      throw error;
    }
  },
);
