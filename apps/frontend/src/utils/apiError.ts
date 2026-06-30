import { ApiError } from "../lib/api";
import { formatJson } from "./formatters";

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return formatJson(error.payload);
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}
