import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { encryptData } from "@/utils/encrypt";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { iCoupon } from "@/interfaces/coupon";
import { apiExternal } from "@/services/axios";

function extractOfferAndProduct(req: NextApiRequest): {
  offerId: string;
  productId: string;
} {
  if (
    typeof req.query.offerId === "string" &&
    typeof req.query.productId === "string"
  ) {
    return {
      offerId: req.query.offerId,
      productId: req.query.productId,
    };
  }

  const referer = req.headers.referer;
  if (!referer) {
    throw new Error("Missing referer");
  }

  let url: URL;
  try {
    url = new URL(referer);
  } catch {
    throw new Error("Invalid referer");
  }

  const offerIdFromQuery = url.searchParams.get("offerId");
  const productIdFromQuery = url.searchParams.get("productId");

  if (offerIdFromQuery && productIdFromQuery) {
    return {
      offerId: offerIdFromQuery,
      productId: productIdFromQuery,
    };
  }

  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts.length >= 1) {
    const offerIdFromPath = pathParts[0];

    if (!productIdFromQuery) {
      throw new Error("Missing productId");
    }

    return {
      offerId: offerIdFromPath,
      productId: productIdFromQuery,
    };
  }

  throw new Error("Missing offerId or productId");
}

export default apiHandler<iCoupon>(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (handleOptions(req, res)) return;

    if (process.env.NODE_ENV === "production") {
      const ipHeader = req.headers["x-forwarded-for"];
      const ip = Array.isArray(ipHeader)
        ? ipHeader[0]
        : ipHeader ?? "unknown";

      if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: "Too many requests" });
      }
    }

    const { params }: Partial<{ params: string[] }> = req.query;
    const [coupon, cpf] = params ?? [];

    if (!coupon) {
      return res.status(400).json({ error: "Coupon is required" });
    }

    let offerId: string;
    let productId: string;

    try {
      ({ offerId, productId } = extractOfferAndProduct(req));
    } catch {
      return res
        .status(400)
        .json({ error: "offerId and productId are required" });
    }

    try {
      const response = await apiExternal.get(
        `/offers/${offerId}/coupon/${coupon}`,
        {
          params: {
            cpf: cpf ?? "",
            id_product: productId,
          },
        },
      );

      return res.status(response.status).json(encryptData(response.data));
    } catch (error) {
      if (isAxiosError(error)) {
        return res
          .status(error.response?.status ?? 500)
          .json(error.response?.data as iCoupon);
      }
      throw error;
    }
  },
);