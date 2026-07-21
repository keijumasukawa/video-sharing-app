export const THUMBNAIL_FALLBACK = "/placeholder.svg";

export const DEFAULT_VIDEO_TITLE = "Untitled";

export const DEFAULT_LIMIT = 12;

export const MAX_LIMIT = 50;

export const VIDEO_STATUS_LABELS = {
  waiting: "Processing",
  preparing: "Processing",
  ready: "Published",
  errored: "Error",
} as const;

export const PROCESSING_REFETCH_INTERVAL = 5000;
