import z from "zod";
import { formUserDataFirstStepSchema } from "./form-schema";

export type iFormDataFistStep = z.infer<typeof formUserDataFirstStepSchema>;
