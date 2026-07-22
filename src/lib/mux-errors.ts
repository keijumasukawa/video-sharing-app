import Mux from "@mux/mux-node";

const ASSET_LIMIT_MESSAGE_PATTERN = /limited to \d+ assets/;

export function isMuxAssetLimitError(error: unknown): boolean {
  if (!(error instanceof Mux.APIError) || error.status !== 400) {
    return false;
  }
  return ASSET_LIMIT_MESSAGE_PATTERN.test(JSON.stringify(error.error ?? ""));
}
