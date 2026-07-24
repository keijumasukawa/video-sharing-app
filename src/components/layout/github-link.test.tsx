import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { REPOSITORY_URL } from "@/constants/app";
import { GitHubLink } from "./github-link";

describe("GitHubLink", () => {
  afterEach(() => {
    cleanup();
  });

  it("リポジトリへのリンクを新しいタブで開く設定で表示する", () => {
    render(<GitHubLink />);
    const link = screen.getByRole("link", { name: "GitHub repository" });
    expect(link).toHaveAttribute("href", REPOSITORY_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
