import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./navigation";

describe("isNavItemActive", () => {
  it("パスが完全一致する場合はアクティブと判定する", () => {
    expect(isNavItemActive("/videos", "/videos")).toBe(true);
  });

  it("配下のパスの場合もアクティブと判定する", () => {
    expect(isNavItemActive("/my-videos/abc", "/my-videos")).toBe(true);
  });

  it("無関係のパスの場合はアクティブと判定しない", () => {
    expect(isNavItemActive("/videos", "/my-videos")).toBe(false);
  });

  it("前方一致するだけの別パスはアクティブと判定しない", () => {
    expect(isNavItemActive("/videos-archive", "/videos")).toBe(false);
  });
});
