import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler } from "@/utils/api-handler";
import { apiExternal } from "@/services/axios";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await apiExternal.get(`/${req.query.afiliateId}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      return res.status(error.response?.status ?? 500);
    }
    throw error;
  }
});
