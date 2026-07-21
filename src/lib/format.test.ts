import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDate,
  formatDuration,
  formatRelativeTime,
  formatUserName,
} from "./format";

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

describe("formatDate", () => {
  it("日付を「d MMM yyyy」形式で返す", () => {
    expect(formatDate(new Date("2026-07-19T11:00:00Z"))).toBe("19 Jul 2026");
    expect(formatDate(new Date("2026-01-05T00:00:00Z"))).toBe("5 Jan 2026");
  });
});

describe("formatUserName", () => {
  it("氏名を半角スペースで結合して返す", () => {
    expect(formatUserName({ firstName: "Taro", lastName: "Yamada" })).toBe(
      "Taro Yamada",
    );
  });

  it("片方が空の場合は余分なスペースを除いて返す", () => {
    expect(formatUserName({ firstName: "Taro", lastName: "" })).toBe("Taro");
    expect(formatUserName({ firstName: "", lastName: "Yamada" })).toBe(
      "Yamada",
    );
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
