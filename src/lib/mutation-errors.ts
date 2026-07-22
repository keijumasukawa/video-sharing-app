import { TRPCClientError } from "@trpc/client";

export function resolveMutationErrorMessage(
  error: unknown,
  fallbackMessage: string | undefined,
): string | undefined {
  if (error instanceof TRPCClientError && error.data?.code === "CONFLICT") {
    return error.message;
  }
  return fallbackMessage;
}
