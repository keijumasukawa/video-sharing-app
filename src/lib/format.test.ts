import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./format";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("数分前の日時を相対表記で返す", () => {
    const date = new Date("2026-07-19T11:55:00Z");
    expect(formatRelativeTime(date)).toBe("5 minutes ago");
  });

  it("数日前の日時を相対表記で返す", () => {
    const date = new Date("2026-07-16T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("3 days ago");
  });
});
