"use client";

import type { QueryClient } from "@tanstack/react-query";
import { MutationCache, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { notifyError, notifySuccess } from "@/lib/notify";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

// ミューテーションごとに通知文言を宣言できるようにする
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

// 各ミューテーションで onError を書き忘れても失敗が必ず通知されるよう、
// グローバルコールバックで一元的に扱う
function makeNotifyingMutationCache() {
  return new MutationCache({
    onSuccess: (_data, _variables, _onMutateResult, mutation) => {
      const message = mutation.meta?.successMessage;
      if (message) {
        notifySuccess(message);
      }
    },
    onError: (_error, _variables, _onMutateResult, mutation) => {
      notifyError(mutation.meta?.errorMessage);
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
