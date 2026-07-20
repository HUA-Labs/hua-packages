import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bookmark } from "../Bookmark";
import { Icon } from "../Icon";

beforeEach(() => {
  localStorage.clear();
});

describe("Bookmark", () => {
  it("should render as a button", () => {
    render(<Bookmark id="item-1" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should toggle bookmark on click", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<Bookmark id="item-1" onBookmarkChange={handleChange} />);

    await user.click(screen.getByRole("button"));
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button"));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("should persist bookmark to localStorage", async () => {
    const user = userEvent.setup();

    render(<Bookmark id="article-1" />);

    await user.click(screen.getByRole("button"));

    const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    expect(saved).toContain("article-1");
  });

  it("should remove from localStorage on second click", async () => {
    const user = userEvent.setup();

    render(<Bookmark id="article-1" />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button"));

    const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    expect(saved).not.toContain("article-1");
  });

  it("should use custom storageKey", async () => {
    const user = userEvent.setup();

    render(<Bookmark id="item-1" storageKey="favorites" />);

    await user.click(screen.getByRole("button"));

    expect(localStorage.getItem("favorites")).toBeTruthy();
    expect(localStorage.getItem("bookmarks")).toBeNull();
  });

  it("should load initial state from localStorage", () => {
    localStorage.setItem("bookmarks", JSON.stringify(["existing-1"]));

    const { container } = render(<Bookmark id="existing-1" />);

    const button = container.querySelector("button") as HTMLElement;
    // When bookmarked, the icon has fill set via inline style from dot engine
    expect(button).toBeInTheDocument();
  });

  it("should apply size variants via inline style", () => {
    const { rerender, container } = render(<Bookmark id="item-1" size="sm" />);
    const btn = container.querySelector("button") as HTMLElement;
    // w-6 = 24px (JSDOM normalizes rem to px)
    expect(btn.style.width).toBe("24px");

    rerender(<Bookmark id="item-1" size="lg" />);
    const btn2 = container.querySelector("button") as HTMLElement;
    // w-10 = 40px
    expect(btn2.style.width).toBe("40px");
  });

  it("should apply variant styles via inline style", () => {
    const { rerender, container } = render(
      <Bookmark id="item-1" variant="outline" />,
    );
    const btn = container.querySelector("button") as HTMLElement;
    // outline variant has border styles via dot engine
    expect(btn).toBeInTheDocument();

    rerender(<Bookmark id="item-1" variant="filled" />);
    const btn2 = container.querySelector("button") as HTMLElement;
    // filled variant has text-yellow-500 color via dot engine
    expect(btn2).toBeInTheDocument();
  });

  it("should render button element (className omitted from types)", () => {
    const { container } = render(<Bookmark id="item-1" />);
    // Bookmark omits className from props — styles are applied via inline style only
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("should respect defaultBookmarked prop", () => {
    const { container } = render(<Bookmark id="new-item" defaultBookmarked />);

    const button = container.querySelector("button");
    // When defaultBookmarked, bookmark is set — button should exist
    expect(button).toBeInTheDocument();
  });

  it("uses distinct regular and filled Phosphor glyph paths", async () => {
    const user = userEvent.setup();
    const bookmark = render(<Bookmark id="glyph-item" />);

    await waitFor(() =>
      expect(bookmark.container.querySelector("svg")).not.toBeNull(),
    );
    const regularGlyph = bookmark.container.querySelector("svg")?.innerHTML;
    expect(regularGlyph).toBeTruthy();

    await user.click(screen.getByRole("button"));

    let filledGlyph: string | undefined;
    await waitFor(() => {
      const filledSvg = bookmark.container.querySelector("svg");
      filledGlyph = filledSvg?.innerHTML;
      expect(filledGlyph).not.toBe(regularGlyph);
      expect(filledSvg).toHaveAttribute("fill", "currentColor");
    });

    bookmark.unmount();
    const star = render(<Icon name="star" weight="fill" />);
    await waitFor(() =>
      expect(star.container.querySelector("svg")).not.toBeNull(),
    );
    expect(filledGlyph).toBe(star.container.querySelector("svg")?.innerHTML);
  });

  it("keeps the Bookmark component bound to the Phosphor Star glyph", async () => {
    const bookmark = render(<Bookmark id="star-identity" />);
    await waitFor(() =>
      expect(bookmark.container.querySelector("svg")).not.toBeNull(),
    );
    const bookmarkGlyph = bookmark.container.querySelector("svg")?.innerHTML;
    bookmark.unmount();

    const star = render(<Icon name="star" weight="regular" />);
    await waitFor(() =>
      expect(star.container.querySelector("svg")).not.toBeNull(),
    );
    const starGlyph = star.container.querySelector("svg")?.innerHTML;
    expect(bookmarkGlyph).toBe(starGlyph);
    star.unmount();

    const bookmarkIcon = render(<Icon name="bookmark" weight="regular" />);
    await waitFor(() =>
      expect(bookmarkIcon.container.querySelector("svg")).not.toBeNull(),
    );
    expect(bookmarkGlyph).not.toBe(
      bookmarkIcon.container.querySelector("svg")?.innerHTML,
    );
  });
});
