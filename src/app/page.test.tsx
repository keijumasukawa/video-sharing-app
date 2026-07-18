import { redirect } from "next/navigation";
import { expect, test, vi } from "vitest";
import Home from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

test("トップページは /videos へリダイレクトする", () => {
  Home();
  expect(redirect).toHaveBeenCalledWith("/videos");
});
