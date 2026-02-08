import * as Sentry from "@sentry/nextjs";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { decryptData } from "@/utils/decrypt";
import { encryptData } from "@/utils/encrypt";
import { apiInternal } from "@/services/axios";

interface iProspRead<TResponse> extends UseQueryOptions {
  route?: string;
  queryKey: string[];
  fullUrl?: string;
  isCrypted?: boolean;
  options?: Omit<
    UseQueryOptions<TResponse, AxiosError, TResponse>,
    "queryKey" | "queryFn"
  >;
}

type ResponseReadType<TResponse> = UseQueryResult<TResponse, AxiosError>;

export function fecthRead<TResponse = AxiosResponse<unknown>>(
  props: iProspRead<TResponse>,
): ResponseReadType<TResponse> {
  const { route, options, queryKey, fullUrl } = props;

  const url = fullUrl && Boolean(fullUrl) ? fullUrl : (route ?? "");

  const keys = options?.enabled ? queryKey : [];

  return useQuery<TResponse, AxiosError<unknown, unknown>, TResponse>({
    ...(options && options),
    queryKey: keys,
    queryFn: async () => {
      try {
        const res = await apiInternal.get(url);
        return (
          "encrypted" in res.data && !fullUrl ? decryptData(res.data) : res.data
        ) as TResponse;
      } catch (error) {
        Sentry.captureException(error);
        if (isAxiosError(error)) {
          const { message } = error.response?.data;

          if (Array.isArray(message)) {
            throw new Error(message[0]);
          }

          throw new Error(message);
        }
        throw error;
      }
    },
  });
}

interface iFetchMutationProps<TData, TResquest> {
  method: "post" | "patch" | "put";
  route: string;
  fullUrl?: string;
  cryptedRound?: number;
  options?: Omit<
    UseMutationOptions<TData, AxiosError, TResquest>,
    " mutationFn"
  >;
}

type ResponseMutationType<TData, TResquest> = UseMutationResult<
  TData,
  AxiosError,
  TResquest
>;

export function fecthMutation<TData, TResquest = unknown>(
  props: iFetchMutationProps<TData, TResquest>,
): ResponseMutationType<TData, TResquest> {
  const { method, route, options, fullUrl } = props;

  const url = fullUrl && Boolean(fullUrl) ? fullUrl : route;

  return useMutation<TData, AxiosError, TResquest>({
    mutationFn: async (data) => {
      try {
        const res = await apiInternal[method](url, encryptData(data));
        return decryptData(res.data) as TData;
      } catch (error) {
        Sentry.captureException(error);
        if (isAxiosError(error)) {
          const { message } = error.response?.data;

          if (Array.isArray(message)) {
            throw new Error(message[0]);
          }

          throw new Error(message);
        }
        throw error;
      }
    },
    ...(options && options),
  });
}
