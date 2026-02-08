import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { apiExternal } from "@/services/axios";

export type FrenetOptionType = {
  company: string | undefined;
  label: string | undefined;
  price: number | undefined;
};

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (handleOptions(req, res)) return;

  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    const ipHeader = req.headers["x-forwarded-for"];
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader ?? "unknown");

    if (!checkRateLimit(ip)) {
      return res.status(429).end("Too many requests");
    }
  }

  if (req.method !== "POST") {
    return res.status(404).end();
  }

  try {
    const response = await apiExternal.post<FrenetOptionType[]>(
      "/shippingOptions",
      decryptData(req.body),
      {
        timeout: 20000,
      },
    );

    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      return res
        .status(error.response?.status ?? 500)
        .json(encryptData([]));
    }
    return res.status(500).json(encryptData([]));
  }
});
