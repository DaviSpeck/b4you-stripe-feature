import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";
import { iFormDataFistStep } from "@/models/checkout-variants/three-steps/steps/first/interface";
import { iFormDataSecondStep } from "@/models/checkout-variants/three-steps/steps/second/interfaces";
import { apiExternal } from "@/services/axios";

type AddressType = iFormDataSecondStep;

type CardType = {
  card_number: string;
  card_holder: string;
  expiration_date: string;
  cvv: number;
  document_number: string;
};

export type paymentCreditCardBodyType = {
  payment_method: "card";
  card: CardType;
  document_number: string;
  address: AddressType;
  type: "subscription" | "single";
  offer_id: string;
  sessionID: string;
} & iFormDataFistStep;

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

  const { type, ...body } = decryptData(req.body) as paymentCreditCardBodyType;

  const endpoint =
    type === "subscription" ? "/sales/subscriptions" : "/sales/card";

  try {
    const queryString = req.url?.split("?")[1];
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    const response = await apiExternal.post(url, body);
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