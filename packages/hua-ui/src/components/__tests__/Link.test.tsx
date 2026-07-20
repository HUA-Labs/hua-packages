import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link } from "../Link";

describe("Link", () => {
  it("should render with href and children", () => {
    render(<Link href="/about">About</Link>);

    const link = screen.getByText("About");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/about");
  });

  it("should apply default variant color via inline style", () => {
    const { container } = render(<Link href="/">Home</Link>);

    const link = container.querySelector("a");
    // default: text-[var(--color-foreground)] -> color: var(--color-foreground)
    expect(link?.style.color).toBe("var(--color-foreground)");
    // md: text-base -> fontSize: 16px
    expect(link?.style.fontSize).toBe("16px");
  });

  it("should apply primary variant color via inline style", () => {
    const { container } = render(
      <Link href="/" variant="primary">
        Link
      </Link>,
    );

    const link = container.querySelector("a");
    // primary: text-[var(--color-primary)] -> color: var(--color-primary)
    expect(link?.style.color).toBe("var(--color-primary)");
  });

  it("should apply underline via inline style", () => {
    const { container } = render(
      <Link href="/" variant="underline">
        Link
      </Link>,
    );

    const link = container.querySelector("a");
    // underline -> textDecorationLine: underline
    expect(link?.style.textDecorationLine).toBe("underline");
  });

  it("should apply size variants via inline style", () => {
    const { container, rerender } = render(
      <Link href="/" size="sm">
        Link
      </Link>,
    );

    // sm: text-sm -> fontSize: 14px
    expect(container.querySelector("a")?.style.fontSize).toBe("14px");

    rerender(
      <Link href="/" size="lg">
        Link
      </Link>,
    );
    // lg: text-lg -> fontSize: 18px
    expect(container.querySelector("a")?.style.fontSize).toBe("18px");
  });

  it("should set target and rel for external links", () => {
    render(
      <Link href="https://example.com" external>
        External
      </Link>,
    );

    const link = screen.getByText("External");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should not set target for internal links", () => {
    render(<Link href="/page">Internal</Link>);

    const link = screen.getByText("Internal");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("should call onClick handler", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Link href="/" onClick={handleClick}>
        Clickable
      </Link>,
    );

    await user.click(screen.getByText("Clickable"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render anchor element", () => {
    render(<Link href="/test">Test Link</Link>);

    expect(screen.getByText("Test Link").tagName).toBe("A");
  });

  it("keeps opaque root classes and lets ordinary CSS own unstyled visuals", async () => {
    const onClick = vi.fn();
    const rawClassName = "legacy-link  css-module_hash";
    const user = userEvent.setup();
    const { container } = render(
      <>
        <style>{`.legacy-link { color: rgb(1, 2, 3); font-size: 31px; transition: none; }`}</style>
        <Link
          href="https://example.com"
          external
          className={rawClassName}
          unstyled
          dot="opacity-50"
          style={{ letterSpacing: "2px" }}
          onClick={onClick}
        >
          Compatible link
        </Link>
      </>,
    );

    const link = screen.getByText("Compatible link");
    expect(link.getAttribute("class")).toBe(rawClassName);
    expect(getComputedStyle(link).fontSize).toBe("31px");
    expect(getComputedStyle(link).color).toBe("rgb(1, 2, 3)");
    expect(link.style.opacity).toBe("0.5");
    expect(link.style.letterSpacing).toBe("2px");
    expect(link.style.transition).toBe("");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    await user.hover(link);
    expect(link.style.opacity).toBe("0.5");
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll(".legacy-link")).toHaveLength(1);
    expect(link).not.toHaveAttribute("unstyled");
  });
});
