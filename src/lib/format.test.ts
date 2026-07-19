import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDuration, formatRelativeTime } from "./format";

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

describe("formatDuration", () => {
  it("1分未満は 0:SS 形式で返す", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(59.9)).toBe("0:59");
  });

  it("1時間未満は M:SS 形式で返す", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
  });

  it("1時間以上は H:MM:SS 形式で返す", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
    expect(formatDuration(7325)).toBe("2:02:05");
  });
});
