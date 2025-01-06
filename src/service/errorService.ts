import axios, { AxiosError } from "axios";

export interface ApiErrorResponse {
  errors?: Record<string, string | string[]>;
}

export function createApiError(error: unknown): string[] {
  const errorMessages: string[] = [];

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.errors) {
      const { errors } = axiosError.response.data;
      Object.values(errors).forEach((errorArray) => {
        if (Array.isArray(errorArray)) {
          errorMessages.push(...errorArray);
        } else if (typeof errorArray === "string") {
          errorMessages.push(errorArray);
        }
      });
    } else {
      errorMessages.push("サーバーエラーが発生しました。");
    }
  } else if (error instanceof Error) {
    errorMessages.push(error.message);
  } else {
    errorMessages.push("予期せぬエラーが発生しました。");
  }

  return errorMessages;
}
