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

export interface iCartInitiateBody {
  offer_uuid: string | null;
  full_name: string;
  document_number?: string;
  email: string;
  whatsapp: string;
  address?: Partial<iAddress>;
  coupon?: string | null;
  params: {
    src: string | null;
    sck: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
}

/**
 * Remove dados sensíveis para log
 */
function sanitizePayload(data: iCartInitiateBody) {
  return {
    offer_uuid: data.offer_uuid,
    email: data.email,
    has_document: Boolean(data.document_number),
    has_address: Boolean(data.address),
    coupon: data.coupon,
    params: data.params,
  };
}

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (handleOptions(req, res)) return;

  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    const ipHeader = req.headers["x-forwarded-for"];
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader ?? "unknown");

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: "RATE_LIMIT",
        message: "Too many requests",
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(404).end();
  }

  const data = decryptData(req.body) as iCartInitiateBody;

  try {
    const response = await apiExternal.post(`/cart/initiate`, data);
    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const backendData = (error.response?.data ?? null) as {
        error?: string;
        message?: string;
      } | null;

      return res.status(status).json({
        error: backendData?.error ?? "CART_INITIATE_FAILED",
        message:
          backendData?.message ??
          "Não foi possível iniciar o carrinho no momento",
        details: backendData ?? null,
      });
    }

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Erro inesperado ao iniciar o carrinho",
    });
  }
});
