import "server-only";
import Mux from "@mux/mux-node";

let client: Mux | undefined;

export function getMux(): Mux {
  client ??= new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    webhookSecret: process.env.MUX_WEBHOOK_SECRET,
  });
  return client;
}
