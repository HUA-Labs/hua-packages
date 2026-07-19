import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Pressable } from "../Pressable";

vi.mock("@hua-labs/dot", () => ({
  dot: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      "px-3": { paddingLeft: "0.75rem", paddingRight: "0.75rem" },
      "py-1": { paddingTop: "0.25rem", paddingBottom: "0.25rem" },
    };
    const result: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      Object.assign(result, styles[token] ?? {});
    }
    return result;
  },
  dotMap: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      "px-3": { paddingLeft: "0.75rem", paddingRight: "0.75rem" },
      "py-1": { paddingTop: "0.25rem", paddingBottom: "0.25rem" },
    };
    const base: Record<string, string> = {};
    const focus: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      if (!token.includes(":")) {
        Object.assign(base, styles[token] ?? {});
      } else if (token.startsWith("focus:")) {
        Object.assign(focus, styles[token.slice("focus:".length)] ?? {});
      }
    }
    return { base, focus };
  },
}));

describe("Pressable", () => {
  it("should render button element", () => {
    render(<Pressable>Click me</Pressable>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it('should have type="button" by default', () => {
    render(<Pressable>Click</Pressable>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Pressable onClick={handleClick}>Click</Pressable>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is set", () => {
    render(<Pressable disabled>Disabled</Pressable>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  it("should apply dot styles", () => {
    render(<Pressable dot="px-3 py-1">Click</Pressable>);
    const btn = screen.getByRole("button");
    expect(btn.style.paddingLeft).toBe("0.75rem");
  });

  it("should merge style override", () => {
    render(
      <Pressable dot="px-3" style={{ color: "green" }}>
        Click
      </Pressable>,
    );
    const btn = screen.getByRole("button");
    expect(btn.style.paddingLeft).toBe("0.75rem");
    expect(btn.style.color).toBe("green");
  });

  it("should render as child element with asChild", () => {
    render(
      <Pressable asChild dot="px-3">
        <a href="/test">Link</a>
      </Pressable>,
    );
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should forward ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Pressable ref={ref}>Click</Pressable>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("keeps touch, generated, and opaque raw classes exactly once", () => {
    render(
      <Pressable classDot="hover:px-3" className="raw__press--hash">
        Click
      </Pressable>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("dot-");
    expect(button.className).toContain("raw__press--hash");
    expect(button.className.match(/raw__press--hash/g)).toHaveLength(1);
    expect(button.className.split(" ").filter(Boolean).length).toBeGreaterThan(
      2,
    );
  });

  it("removes visual defaults in unstyled mode but preserves touch, dot, and style", () => {
    render(
      <Pressable
        unstyled
        className="raw-press"
        dot="px-3"
        style={{ color: "purple" }}
      >
        Click
      </Pressable>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("raw-press");
    expect(button.className).toContain("dot-");
    expect(button.style.display).toBe("");
    expect(button.style.cursor).toBe("");
    expect(button.style.paddingLeft).toBe("0.75rem");
    expect(button.style.color).toBe("purple");
    expect(button).not.toHaveAttribute("unstyled");
  });

  it.each(["native", "asChild"] as const)(
    "composes %s focus and blur through Dot, consumer, and child handlers",
    (mode) => {
      const consumerFocus = vi.fn();
      const consumerBlur = vi.fn();
      const childFocus = vi.fn();
      const childBlur = vi.fn();
      render(
        mode === "native" ? (
          <Pressable
            dot="focus:px-3"
            onFocus={consumerFocus}
            onBlur={consumerBlur}
          >
            Native
          </Pressable>
        ) : (
          <Pressable
            asChild
            dot="focus:px-3"
            onFocus={consumerFocus}
            onBlur={consumerBlur}
          >
            <a href="#focus" onFocus={childFocus} onBlur={childBlur}>
              Child
            </a>
          </Pressable>
        ),
      );
      const target = screen.getByRole(mode === "native" ? "button" : "link");

      fireEvent.focus(target);
      expect(target.style.paddingLeft).toBe("0.75rem");
      expect(consumerFocus).toHaveBeenCalledTimes(1);
      expect(childFocus).toHaveBeenCalledTimes(mode === "asChild" ? 1 : 0);

      fireEvent.blur(target);
      expect(target.style.paddingLeft).toBe("");
      expect(consumerBlur).toHaveBeenCalledTimes(1);
      expect(childBlur).toHaveBeenCalledTimes(mode === "asChild" ? 1 : 0);
    },
  );

  it("prevents disabled asChild activation and overrides child tab authority", () => {
    const consumerClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Pressable asChild disabled onClick={consumerClick}>
        <a
          href="#disabled"
          aria-disabled="false"
          tabIndex={0}
          onClick={childClick}
        >
          Disabled child
        </a>
      </Pressable>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(consumerClick).not.toHaveBeenCalled();
    expect(childClick).not.toHaveBeenCalled();
  });

  it("keeps enabled asChild consumer and child activation exactly once", () => {
    const consumerClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Pressable asChild onClick={consumerClick}>
        <a href="#enabled" onClick={childClick}>
          Enabled child
        </a>
      </Pressable>,
    );

    fireEvent.click(screen.getByRole("link"));
    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("guards disabled asChild capture before consumer and child callbacks", () => {
    const consumerCapture = vi.fn();
    const childCapture = vi.fn();
    render(
      <Pressable asChild unstyled disabled onClickCapture={consumerCapture}>
        <a href="#disabled-capture" onClickCapture={childCapture}>
          Disabled capture
        </a>
      </Pressable>,
    );

    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    screen.getByRole("link").dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(consumerCapture).not.toHaveBeenCalled();
    expect(childCapture).not.toHaveBeenCalled();
  });

  it("composes enabled asChild capture parent-first exactly once", () => {
    const order: string[] = [];
    render(
      <Pressable asChild onClickCapture={() => order.push("pressable")}>
        <a href="#enabled-capture" onClickCapture={() => order.push("child")}>
          Enabled capture
        </a>
      </Pressable>,
    );

    fireEvent.click(screen.getByRole("link"));
    expect(order).toEqual(["pressable", "child"]);
  });

  it("keeps native disabled ARIA authoritative without inventing tab policy", () => {
    const disabledMarkup = renderToStaticMarkup(
      <Pressable disabled aria-disabled={false} tabIndex={0}>
        Native disabled
      </Pressable>,
    );
    expect(disabledMarkup).toContain('disabled=""');
    expect(disabledMarkup).toContain('aria-disabled="true"');
    expect(disabledMarkup).toContain('tabindex="0"');

    const enabledMarkup = renderToStaticMarkup(
      <Pressable aria-disabled={false} tabIndex={0}>
        Native enabled
      </Pressable>,
    );
    expect(enabledMarkup).toContain('aria-disabled="false"');
    expect(enabledMarkup).toContain('tabindex="0"');
  });
});
