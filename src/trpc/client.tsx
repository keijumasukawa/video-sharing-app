"use client";

import type { QueryClient } from "@tanstack/react-query";
import { MutationCache, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { resolveMutationErrorMessage } from "@/lib/mutation-errors";
import { notifyError, notifySuccess } from "@/lib/notify";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      successMessage?: string;
      errorMessage?: string;
    };
  }
}

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function makeNotifyingMutationCache() {
  return new MutationCache({
    onSuccess: (_data, _variables, _onMutateResult, mutation) => {
      const message = mutation.meta?.successMessage;
      if (message) {
        notifySuccess(message);
      }
    },
    onError: (error, _variables, _onMutateResult, mutation) => {
      notifyError(resolveMutationErrorMessage(error, mutation.meta?.errorMessage));
    },
  });
}

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient(makeNotifyingMutationCache());
  }
  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

export function TRPCReactProvider(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
