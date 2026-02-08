import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipHeaderContext?: boolean;
  }

  export interface AxiosError<_T = unknown, _D = unknown> {
    isServerError?: boolean;
  }
}
