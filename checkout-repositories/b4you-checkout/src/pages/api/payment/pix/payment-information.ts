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

export type paymentPixResponse = {
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
      return res.status(429).json({ message: "Too many requests" });
    }
  }

  if (req.method !== "POST") {
    return res.status(404).end();
  }

  if (!req.body || typeof req.body !== "object" || !("encrypted" in req.body)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  let payload: paymentPixResponse;
  const encryptedBody = req.body as { encrypted: string };
  try {
    payload = decryptData(encryptedBody) as paymentPixResponse;
  } catch (error) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { type, ...body } = payload;

  const endpoint =
    type === "subscription" ? "/sales/subscriptions" : "/sales/pix";

  try {
    const queryString = req.url?.split("?")[1];
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    const response = await apiExternal.post(url, body);
    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      return res
        .status(error.response?.status ?? 500)
        .json((error.response?.data ?? {}) as paymentPixResponse);
    }
    return res.status(500).json({} as paymentPixResponse);
  }
});
