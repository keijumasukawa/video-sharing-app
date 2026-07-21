import {
  defaultShouldDehydrateQuery,
  type MutationCache,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient(mutationCache?: MutationCache) {
  return new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
