import { isAxiosError } from "axios";
import { apiHandler } from "@/utils/api-handler";
import { encryptData } from "@/utils/encrypt";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { iAddress } from "@/models/checkout-variants/three-steps/steps/second/interfaces";
import { apiExternal } from "@/services/axios";

type CouponType = {
  id: string;
  code: string;
  discount: number;
  finalValue: number;
};

export interface iAbandonedCartResponse {
  address: iAddress | null;
  coupon: CouponType | null;
  full_name: string | null;
  email: string | null;
  id_affiliate: string | null;
  document_number: string | null;
  whatsapp: string | null;
}

export default apiHandler(async (req, res) => {
  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    const ipHeader = req.headers["x-forwarded-for"];
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : (ipHeader ?? "unknown");

    if (!checkRateLimit(ip)) {
      return new Response("Too many requests", { status: 429 });
    }
  }

  try {
    const response = await apiExternal.get(`/cart/${req.query.cartId}`);
    return res.status(response.status).json(encryptData(response.data));
  } catch (error) {
    if (isAxiosError(error)) {
      return res.status(error.response?.status ?? 500).json(
        (error.response?.data as iAbandonedCartResponse) || {
          message: "Erro na API externa",
        },
      );
    }
    throw error;
  }
});
