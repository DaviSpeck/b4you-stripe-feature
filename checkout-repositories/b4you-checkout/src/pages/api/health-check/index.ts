import axios from "axios";
import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { handleOptions } from "@/utils/handle-options";
import { checkRateLimit } from "@/utils/request-rate-limit";
import { env } from "@/env";

export default apiHandler<boolean | { message: string }>(
  async (
    req: NextApiRequest,
    res: NextApiResponse<boolean | { message: string }>,
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

    try {
      await axios.get(env.NEXT_PUBLIC_REACT_APP_BASE_URL);
      return res.status(200).json({ message: "server working" });
    } catch (error) {
      if (isAxiosError(error)) {
        return res.status(500).json({ message: "server off" });
      }
      throw error;
    }
  },
);
