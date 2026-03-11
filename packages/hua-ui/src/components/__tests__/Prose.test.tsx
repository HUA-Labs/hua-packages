import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Prose } from "../Prose";

vi.mock("@hua-labs/dot", () => ({
  dot: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      "mt-4": { marginTop: "1rem" },
      "max-w-2xl": { maxWidth: "42rem" },
      "p-6": { padding: "1.5rem" },
    };
    const result: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      Object.assign(result, styles[token] ?? {});
    }
    return result;
  },
}));

describe("Prose", () => {
  it("should render children", () => {
    render(
      <Prose>
        <p>Hello Prose</p>
      </Prose>,
    );
    expect(screen.getByText("Hello Prose")).toBeInTheDocument();
  });

  it("should render div by default", () => {
    const { container } = render(
      <Prose>
        <p>Content</p>
      </Prose>,
    );
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should apply hua-prose class", () => {
    const { container } = render(
      <Prose>
        <p>Content</p>
      </Prose>,
    );
    expect(container.firstChild).toHaveClass("hua-prose");
  });

  it("should render as different element via as prop", () => {
    const { container } = render(
      <Prose as="article">
        <p>Content</p>
      </Prose>,
    );
    expect(container.querySelector("article")).toBeInTheDocument();
    expect(container.querySelector("div")).toBeNull();
  });

  it("should render as section", () => {
    const { container } = render(
      <Prose as="section">
        <p>Content</p>
      </Prose>,
    );
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("should not set data-prose-size when size is base (default)", () => {
    const { container } = render(
      <Prose>
        <p>Content</p>
      </Prose>,
    );
    expect(container.firstChild).not.toHaveAttribute("data-prose-size");
  });

  it('should set data-prose-size="sm" for sm size', () => {
    const { container } = render(
      <Prose size="sm">
        <p>Content</p>
      </Prose>,
    );
    expect(container.firstChild).toHaveAttribute("data-prose-size", "sm");
  });

  it('should set data-prose-size="lg" for lg size', () => {
    const { container } = render(
      <Prose size="lg">
        <p>Content</p>
      </Prose>,
    );
    expect(container.firstChild).toHaveAttribute("data-prose-size", "lg");
  });

  it("should not set data-prose-color when color is default", () => {
    const { container } = render(
      <Prose>
        <p>Content</p>
      </Prose>,
    );
    expect(container.firstChild).not.toHaveAttribute("data-prose-color");
  });

  it('should set data-prose-color="gray" for gray color', () => {
    const { container } = render(
      <Prose color="gray">
        <p>Content</p>
      </Prose>,
    );
    expect(container.firstChild).toHaveAttribute("data-prose-color", "gray");
  });

  it("should apply dot styles", () => {
    const { container } = render(
      <Prose dot="mt-4">
        <p>Content</p>
      </Prose>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.marginTop).toBe("1rem");
  });

  it("should merge dot and explicit style", () => {
    const { container } = render(
      <Prose dot="mt-4" style={{ color: "red" }}>
        <p>Content</p>
      </Prose>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.marginTop).toBe("1rem");
    expect(el.style.color).toBe("red");
  });

  it("should forward ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Prose ref={ref}>
        <p>Content</p>
      </Prose>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("should pass through HTML attributes", () => {
    render(
      <Prose data-testid="my-prose" aria-label="article content">
        <p>Content</p>
      </Prose>,
    );
    const el = screen.getByTestId("my-prose");
    expect(el).toHaveAttribute("aria-label", "article content");
  });

  it("should render rich content children", () => {
    render(
      <Prose>
        <h1>Title</h1>
        <p>Paragraph</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <blockquote>Quote text</blockquote>
        <pre>
          <code>code block</code>
        </pre>
      </Prose>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Title",
    );
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Quote text")).toBeInTheDocument();
    expect(screen.getByText("code block")).toBeInTheDocument();
  });

  it("should combine size and color variants", () => {
    const { container } = render(
      <Prose size="lg" color="gray">
        <p>Content</p>
      </Prose>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute("data-prose-size", "lg");
    expect(el).toHaveAttribute("data-prose-color", "gray");
  });

  it("should not allow className to override hua-prose", () => {
    const { container } = render(
      <Prose {...({ className: "external" } as Record<string, unknown>)}>
        <p>Content</p>
      </Prose>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("hua-prose");
    expect(el).not.toHaveClass("external");
  });
});
