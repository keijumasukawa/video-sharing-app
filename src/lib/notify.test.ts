import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ERROR_MESSAGE } from "@/constants/messages";
import { notifyError, notifySuccess } from "./notify";

const { successMock, errorMock } = vi.hoisted(() => ({
  successMock: vi.fn(),
  errorMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: successMock, error: errorMock },
}));

describe("notify", () => {
  beforeEach(() => {
    successMock.mockClear();
    errorMock.mockClear();
  });

  it("成功メッセージを通知する", () => {
    notifySuccess("Video uploaded");
    expect(successMock).toHaveBeenCalledWith("Video uploaded");
  });

  it("失敗メッセージを通知する", () => {
    notifyError("Upload failed");
    expect(errorMock).toHaveBeenCalledWith("Upload failed");
  });

  it("メッセージを省略した場合は既定の文言で通知する", () => {
    notifyError();
    expect(errorMock).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGE);
  });
});
