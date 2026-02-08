import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { iAddress } from "@/models/checkout-variants/three-steps/steps/second/interfaces";
import { apiExternal } from "@/services/axios";

export type paymentBankSlipResponse = {
  sale_id: string;
  qrcode: string;
  pix_code: string;
  upsell_url: string | null;
  price: number;
  type: "subscription" | "single";
  student: {
    full_name: string;
    email: string;
    whatsapp: string;
    document_number: string;
    address: iAddress;
  };
};

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
    const queryString = req.url?.split("?")[1];
    const url = queryString ? `/sales/billet?${queryString}` : "/sales/billet";
    const response = await apiExternal.post(url, decryptData(req.body));
    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      return res
        .status(error.response?.status ?? 500)
        .json((error.response?.data ?? {}) as paymentBankSlipResponse);
    }
    return res.status(500).json({} as paymentBankSlipResponse);
  }
});
