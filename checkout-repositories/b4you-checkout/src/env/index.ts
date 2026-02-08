import z from "zod";

const env_schema = z.object({
  NEXT_PUBLIC_REACT_APP_BASE_URL: z
    .string({ required_error: "Variável obrigatória" })
    .url({ message: "Variável deve ser uma url" }),
  NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL: z
    .string({ required_error: "Variável obrigatória" })
    .url({ message: "Variável deve ser uma url" }),
  NEXT_PUBLIC_CORS_ALLOWED_ORIGINS: z.string().optional(),
  NEXT_PUBLIC_NODE_ENV: z.enum(["dev", "production", "test"], {
    required_error: "Variável obrigatória",
    invalid_type_error: "Valor deve ser dev ou production",
  }),
  NEXT_PUBLIC_SITE_KEY: z.string({ required_error: "Variável obrigatória" }),
  RATE_LIMIT: z.string().default("25"),
  RESET_LIMIT_TIME_IN_MINUTS: z.string().default("1"),
});

const envs = {
  NEXT_PUBLIC_REACT_APP_BASE_URL: process.env.NEXT_PUBLIC_REACT_APP_BASE_URL,
  NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_SITE_KEY: process.env.NEXT_PUBLIC_SITE_KEY,
  NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL:
    process.env.NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL,
  NEXT_PUBLIC_CORS_ALLOWED_ORIGINS: process.env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS,
  RATE_LIMIT: process.env.RATE_LIMIT,
  RESET_LIMIT_TIME_IN_MINUTS: process.env.RESET_LIMIT_TIME_IN_MINUTS,
};
const { success, data, error } = env_schema.safeParse(envs);

if (!success) {
  throw new Error(JSON.stringify(error.flatten().fieldErrors, null, 2));
}

export const env: z.infer<typeof env_schema> = data;
