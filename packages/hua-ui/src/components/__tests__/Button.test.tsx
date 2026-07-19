import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("should render button element", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("should show loading state", () => {
    render(<Button loading>Loading</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("should render as anchor when href is provided", () => {
    render(<Button href="/test">Link</Button>);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should apply variant styles via inline style", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);

    const button = container.querySelector("button");
    expect(button).toHaveStyle({ backgroundColor: "var(--color-destructive)" });
  });

  it("owns loading semantics and activation through asChild", () => {
    const buttonClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Button
        asChild
        loading
        aria-busy={false}
        aria-disabled={false}
        onClick={buttonClick}
      >
        <a
          href="/save"
          className="consumer-link"
          style={{ color: "red" }}
          onClick={childClick}
        >
          Save
        </a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: /save/i });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(link).toHaveClass("consumer-link");
    expect(link.style.color).toBe("red");
    expect(screen.getByRole("status")).toHaveTextContent("로딩 중");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(buttonClick).not.toHaveBeenCalled();
    expect(childClick).not.toHaveBeenCalled();
  });

  it("preserves non-loading asChild props, ref, and event composition", async () => {
    const buttonClick = vi.fn();
    const childClick = vi.fn();
    const ref = React.createRef<HTMLAnchorElement>();
    const user = userEvent.setup();
    render(
      <Button asChild ref={ref} aria-busy onClick={buttonClick}>
        <a
          href="#save"
          className="consumer-link"
          style={{ color: "red" }}
          onClick={childClick}
        >
          Save
        </a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Save" });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute("href", "#save");
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveClass("consumer-link");
    expect(link.style.color).toBe("red");
    await user.click(link);
    expect(buttonClick).toHaveBeenCalledTimes(1);
    expect(childClick).toHaveBeenCalledTimes(1);
  });

  it("preserves an exact string-only child contract without adornments", () => {
    function StringOnlyChild({
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: string }) {
      return <a {...props}>{children.toUpperCase()}</a>;
    }

    render(
      <Button asChild>
        <StringOnlyChild href="#save">save</StringOnlyChild>
      </Button>,
    );

    expect(screen.getByRole("link", { name: "SAVE" })).toHaveAttribute(
      "href",
      "#save",
    );
  });

  it("preserves generated and opaque raw classes in native and anchor modes", () => {
    const { rerender } = render(
      <Button classDot="hover:p-2" className="raw__button--hash">
        Native
      </Button>,
    );
    const native = screen.getByRole("button");
    expect(native.className).toContain("dot-");
    expect(native).toHaveClass("raw__button--hash");

    rerender(
      <Button href="#anchor" classDot="hover:p-2" className="raw__anchor--hash">
        Anchor
      </Button>,
    );
    const anchor = screen.getByRole("link");
    expect(anchor.className).toContain("dot-");
    expect(anchor).toHaveClass("raw__anchor--hash");
  });

  it("orders generated, raw, and asChild classes without token loss", () => {
    render(
      <Button asChild classDot="hover:p-2" className="raw__button--hash">
        <a className="child-class" href="#child">
          Child
        </a>
      </Button>,
    );
    const link = screen.getByRole("link");
    const tokens = link.className.split(" ").filter(Boolean);
    expect(tokens[0]).toMatch(/^dot-/);
    expect(tokens).toContain("raw__button--hash");
    expect(tokens.at(-1)).toBe("child-class");
    expect(link.className.match(/raw__button--hash/g)).toHaveLength(1);
  });

  it("removes owned visual defaults in unstyled mode while preserving dot and style", () => {
    render(
      <Button
        unstyled
        className="raw-button"
        dot="m-2"
        style={{ color: "purple" }}
      >
        Plain
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("raw-button");
    expect(button.style.display).toBe("");
    expect(button.style.backgroundColor).toBe("");
    expect(button.style.margin).not.toBe("");
    expect(button.style.color).toBe("purple");
    expect(button).not.toHaveAttribute("unstyled");
  });

  it("does not reintroduce default variant visuals while unstyled is hovered", () => {
    render(<Button unstyled>Plain hover</Button>);
    const button = screen.getByRole("button");
    expect(button.style.opacity).toBe("");
    expect(button.style.transform).toBe("");

    fireEvent.mouseEnter(button);
    expect(button.style.opacity).toBe("");
    expect(button.style.transform).toBe("");

    fireEvent.mouseLeave(button);
    expect(button.style.opacity).toBe("");
    expect(button.style.transform).toBe("");
  });

  it("preserves an explicitly requested hover effect while unstyled", () => {
    render(
      <Button unstyled hover="scale">
        Requested hover
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.style.transition).toContain("transform");

    fireEvent.mouseEnter(button);
    expect(button.style.transform).toBe("scale(1.015)");
  });

  it.each(["native", "anchor", "asChild"] as const)(
    "keeps explicit unstyled style final over requested %s hover and clears it when disabled",
    (mode) => {
      const renderButton = (disabled = false) =>
        mode === "native" ? (
          <Button
            unstyled
            hover="scale"
            disabled={disabled}
            style={{ transform: "rotate(10deg)" }}
          >
            Native precedence
          </Button>
        ) : mode === "anchor" ? (
          <Button
            href="#precedence"
            unstyled
            hover="scale"
            disabled={disabled}
            style={{ transform: "rotate(10deg)" }}
          >
            Anchor precedence
          </Button>
        ) : (
          <Button
            asChild
            unstyled
            hover="scale"
            disabled={disabled}
            style={{ transform: "rotate(10deg)" }}
          >
            <a href="#precedence">Child precedence</a>
          </Button>
        );

      const { rerender } = render(renderButton());
      const target = screen.getByRole(mode === "native" ? "button" : "link");
      expect(target.style.transform).toBe("rotate(10deg)");

      fireEvent.mouseEnter(target);
      expect(target.style.transform).toBe("rotate(10deg)");

      rerender(renderButton(true));
      expect(target.style.transform).toBe("rotate(10deg)");

      rerender(renderButton());
      expect(target.style.transform).toBe("rotate(10deg)");
    },
  );

  it.each(["native", "anchor", "asChild"] as const)(
    "suppresses held unstyled %s hover across a disabled transition",
    (mode) => {
      const renderButton = (disabled = false) =>
        mode === "native" ? (
          <Button unstyled hover="scale" disabled={disabled}>
            Native disabled transition
          </Button>
        ) : mode === "anchor" ? (
          <Button
            href="#disabled-transition"
            unstyled
            hover="scale"
            disabled={disabled}
          >
            Anchor disabled transition
          </Button>
        ) : (
          <Button asChild unstyled hover="scale" disabled={disabled}>
            <a href="#disabled-transition">Child disabled transition</a>
          </Button>
        );

      const { rerender } = render(renderButton());
      const target = screen.getByRole(mode === "native" ? "button" : "link");
      fireEvent.mouseEnter(target);
      expect(target.style.transform).toBe("scale(1.015)");

      rerender(renderButton(true));
      expect(target.style.transform).toBe("");

      rerender(renderButton());
      expect(target.style.transform).toBe("");
    },
  );

  it.each(["disabled", "loading"] as const)(
    "guards %s asChild capture before Button and child callbacks",
    (blockedState) => {
      const buttonCapture = vi.fn();
      const childCapture = vi.fn();
      render(
        <Button
          asChild
          unstyled
          onClickCapture={buttonCapture}
          {...(blockedState === "disabled"
            ? { disabled: true }
            : { loading: true })}
        >
          <a href="#blocked-capture" onClickCapture={childCapture}>
            Blocked capture
          </a>
        </Button>,
      );

      const click = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      screen.getByRole("link").dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(buttonCapture).not.toHaveBeenCalled();
      expect(childCapture).not.toHaveBeenCalled();
    },
  );

  it("composes enabled asChild capture parent-first exactly once", () => {
    const order: string[] = [];
    render(
      <Button asChild unstyled onClickCapture={() => order.push("button")}>
        <a href="#enabled-capture" onClickCapture={() => order.push("child")}>
          Enabled capture
        </a>
      </Button>,
    );

    fireEvent.click(screen.getByRole("link"));
    expect(order).toEqual(["button", "child"]);
  });

  it.each(["disabled", "loading"] as const)(
    "guards %s anchor capture before the Button callback",
    (blockedState) => {
      const capture = vi.fn();
      render(
        <Button
          href="#blocked-anchor-capture"
          unstyled
          onClickCapture={capture}
          {...(blockedState === "disabled"
            ? { disabled: true }
            : { loading: true })}
        >
          Blocked anchor capture
        </Button>,
      );

      const click = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      screen.getByRole("link").dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(capture).not.toHaveBeenCalled();
    },
  );

  it("keeps enabled anchor capture exactly once", () => {
    const capture = vi.fn();
    render(
      <Button href="#enabled-anchor-capture" unstyled onClickCapture={capture}>
        Enabled anchor capture
      </Button>,
    );

    fireEvent.click(screen.getByRole("link"));
    expect(capture).toHaveBeenCalledTimes(1);
  });

  it.each(["native", "anchor", "asChild"] as const)(
    "composes %s Button-level focus and mouse handlers with internal state exactly once",
    (mode) => {
      const calls = {
        focus: vi.fn(),
        blur: vi.fn(),
        enter: vi.fn(),
        leave: vi.fn(),
        down: vi.fn(),
        up: vi.fn(),
      };
      const childCalls = {
        focus: vi.fn(),
        blur: vi.fn(),
        enter: vi.fn(),
        leave: vi.fn(),
        down: vi.fn(),
        up: vi.fn(),
      };
      const common = {
        onFocus: calls.focus,
        onBlur: calls.blur,
        onMouseEnter: calls.enter,
        onMouseLeave: calls.leave,
        onMouseDown: calls.down,
        onMouseUp: calls.up,
      };

      render(
        mode === "native" ? (
          <Button {...common}>Native events</Button>
        ) : mode === "anchor" ? (
          <Button href="#events" {...common}>
            Anchor events
          </Button>
        ) : (
          <Button asChild {...common}>
            <a
              href="#events"
              onFocus={childCalls.focus}
              onBlur={childCalls.blur}
              onMouseEnter={childCalls.enter}
              onMouseLeave={childCalls.leave}
              onMouseDown={childCalls.down}
              onMouseUp={childCalls.up}
            >
              Child events
            </a>
          </Button>
        ),
      );
      const target = screen.getByRole(mode === "native" ? "button" : "link");
      const initialShadow = target.style.boxShadow;

      fireEvent.focus(target);
      expect(target.style.boxShadow).not.toBe(initialShadow);
      fireEvent.mouseEnter(target);
      expect(target.style.transform).toBe("scale(1.015)");
      fireEvent.mouseDown(target);
      expect(target.style.transform).toBe("scale(0.985)");
      fireEvent.mouseUp(target);
      fireEvent.mouseLeave(target);
      fireEvent.blur(target);

      for (const callback of Object.values(calls)) {
        expect(callback).toHaveBeenCalledTimes(1);
      }
      for (const callback of Object.values(childCalls)) {
        expect(callback).toHaveBeenCalledTimes(mode === "asChild" ? 1 : 0);
      }
      expect(target.style.boxShadow).toBe(initialShadow);
      expect(target.style.transform).toBe("");
    },
  );

  it("preserves Slot parent-first and defaultPrevented child suppression", () => {
    const order: string[] = [];
    render(
      <Button
        asChild
        onMouseDown={(event) => {
          order.push("button");
          event.preventDefault();
        }}
      >
        <a
          href="#suppressed"
          onMouseDown={() => {
            order.push("child");
          }}
        >
          Suppressed child
        </a>
      </Button>,
    );

    const down = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });
    fireEvent(screen.getByRole("link"), down);
    expect(down.defaultPrevented).toBe(true);
    expect(order).toEqual(["button"]);
  });

  it.each(["native", "anchor", "asChild"] as const)(
    "hydrates deterministic %s class bytes without replacing the server node",
    async (mode) => {
      const rawClass = `raw__${mode}--hash`;
      const element =
        mode === "native" ? (
          <Button classDot="hover:p-2" className={rawClass}>
            Native hydrate
          </Button>
        ) : mode === "anchor" ? (
          <Button href="#hydrate" classDot="hover:p-2" className={rawClass}>
            Anchor hydrate
          </Button>
        ) : (
          <Button asChild classDot="hover:p-2" className={rawClass}>
            <a className="child-hydrate" href="#hydrate">
              Child hydrate
            </a>
          </Button>
        );
      const serverMarkup = renderToString(element);
      const container = document.createElement("div");
      container.innerHTML = serverMarkup;
      const serverNode = container.firstElementChild;
      const recoverable = vi.fn();
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      let root: ReturnType<typeof hydrateRoot> | undefined;

      try {
        await React.act(async () => {
          root = hydrateRoot(container, element, {
            onRecoverableError: recoverable,
          });
          await Promise.resolve();
        });

        const hydrated = container.firstElementChild as HTMLElement;
        expect(hydrated).toBe(serverNode);
        expect(container.innerHTML).toBe(serverMarkup);
        expect(hydrated.tagName).toBe(mode === "native" ? "BUTTON" : "A");
        expect(
          hydrated.className.match(new RegExp(rawClass, "g")),
        ).toHaveLength(1);
        expect(hydrated.className.match(/dot-/g)).toHaveLength(1);
        if (mode === "asChild") {
          expect(hydrated.className.match(/child-hydrate/g)).toHaveLength(1);
        }
        expect(recoverable).not.toHaveBeenCalled();
        expect(consoleError).not.toHaveBeenCalled();
      } finally {
        await React.act(async () => root?.unmount());
        consoleError.mockRestore();
      }
    },
  );
});
