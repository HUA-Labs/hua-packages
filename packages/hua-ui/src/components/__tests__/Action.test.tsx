import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Action } from "../Action";

describe("Action", () => {
  it("should render children", () => {
    render(<Action>Click me</Action>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should set data-action attribute", () => {
    render(<Action actionType="magical">Btn</Action>);
    expect(screen.getByText("Btn").closest("[data-action]")).toHaveAttribute(
      "data-action",
      "magical",
    );
  });

  it("should set data-feedback attribute", () => {
    render(<Action feedback="particle">Btn</Action>);
    expect(screen.getByText("Btn").closest("[data-feedback]")).toHaveAttribute(
      "data-feedback",
      "particle",
    );
  });

  it("should default to primary actionType", () => {
    render(<Action>Btn</Action>);
    expect(screen.getByText("Btn").closest("[data-action]")).toHaveAttribute(
      "data-action",
      "primary",
    );
  });

  it("should apply style variables", () => {
    const { container } = render(
      <Action
        transparency={0.5}
        blurIntensity={10}
        glowIntensity={5}
        glowColor="red"
      >
        Btn
      </Action>,
    );
    const btn = container.querySelector("button") as HTMLElement;
    expect(btn.style.getPropertyValue("--action-opacity")).toBe("0.5");
    expect(btn.style.getPropertyValue("--action-blur")).toBe("10px");
  });

  it("should call onClick", () => {
    const handleClick = vi.fn();
    render(<Action onClick={handleClick}>Btn</Action>);
    fireEvent.click(screen.getByText("Btn"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Action onClick={handleClick} disabled>
        Btn
      </Action>,
    );
    fireEvent.click(screen.getByText("Btn"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should not call onClick when loading", () => {
    const handleClick = vi.fn();
    render(
      <Action onClick={handleClick} loading>
        Btn
      </Action>,
    );
    fireEvent.click(screen.getByText("Btn"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should be non-interactive when loading", () => {
    const { container } = render(<Action loading>Btn</Action>);
    // Action in loading state applies cursor-wait opacity via dot engine
    const button = container.querySelector("button") as HTMLElement;
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("style")).toContain("cursor");
  });

  it("delegates loading semantics to the native Button branch", () => {
    render(
      <Action loading aria-busy={false}>
        Save
      </Action>,
    );

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("status")).toHaveTextContent("로딩 중");
  });

  it("delegates loading semantics to the anchor Button branch", () => {
    const handleClick = vi.fn();
    render(
      <Action href="/save" loading aria-busy={false} onClick={handleClick}>
        Save
      </Action>,
    );

    const link = screen.getByRole("link", { name: /save/i });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("status")).toHaveTextContent("로딩 중");
    fireEvent.click(link);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("preserves Button-owned loading truth through asChild", () => {
    const actionClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Action
        asChild
        loading
        aria-busy={false}
        aria-disabled={false}
        onClick={actionClick}
      >
        <a href="/save" onClick={childClick}>
          Save
        </a>
      </Action>,
    );

    const link = screen.getByRole("link", { name: /save/i });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("status")).toHaveTextContent("로딩 중");

    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(actionClick).not.toHaveBeenCalled();
    expect(childClick).not.toHaveBeenCalled();
  });

  it("should render the button element", () => {
    const { container } = render(<Action>Btn</Action>);
    // Action uses dot engine — styles are inline. Just verify button renders.
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("consumes inherited unstyled and removes Action visual defaults", () => {
    render(
      <Action
        unstyled
        className="raw-action"
        dot="m-2"
        style={{ color: "purple" }}
      >
        Plain action
      </Action>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("raw-action");
    expect(button).not.toHaveAttribute("unstyled");
    expect(button.style.getPropertyValue("--action-opacity")).toBe("");
    expect(button.style.getPropertyValue("--action-blur")).toBe("");
    expect(button.style.margin).not.toBe("");
    expect(button.style.color).toBe("purple");
    expect(button).toHaveAttribute("data-action", "primary");
    expect(button).toHaveAttribute("data-feedback", "ripple");
  });

  it("preserves styled Action variables when unstyled is omitted", () => {
    render(<Action className="raw-action">Styled action</Action>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("raw-action");
    expect(button.style.getPropertyValue("--action-opacity")).toBe("1");
    expect(button.style.getPropertyValue("--action-blur")).toBe("0px");
  });

  it.each(["native", "anchor", "asChild"] as const)(
    "inherits unstyled through the enabled %s branch and runs an explicit ripple once",
    (mode) => {
      vi.useFakeTimers();
      const consumerClick = vi.fn();
      const childClick = vi.fn();
      const ref = React.createRef<HTMLButtonElement | HTMLAnchorElement>();
      const common = {
        ref,
        unstyled: true,
        iconOnly: true,
        "aria-label": `${mode} action`,
        className: `raw__action-${mode}`,
        dot: "m-2",
        style: { color: "purple" },
        rippleEffect: true,
        onClick: consumerClick,
      };

      try {
        render(
          mode === "native" ? (
            <Action {...common}>Native action</Action>
          ) : mode === "anchor" ? (
            <Action {...common} href="#action">
              Anchor action
            </Action>
          ) : (
            <Action {...common} asChild>
              <a className="child-action" href="#action" onClick={childClick}>
                Child action
              </a>
            </Action>
          ),
        );
        const target = screen.getByRole(mode === "native" ? "button" : "link");
        const rawClass = `raw__action-${mode}`;
        expect(ref.current).toBe(target);
        expect(target.className.match(new RegExp(rawClass, "g"))).toHaveLength(
          1,
        );
        expect(target).not.toHaveClass("hua-action");
        expect(target.style.display).toBe("");
        expect(target.style.justifyContent).toBe("");
        expect(target.style.boxShadow).toBe("");
        expect(target.style.margin).not.toBe("");
        expect(target.style.color).toBe("purple");
        expect(target.getAttribute("style")).not.toContain("--action-");
        expect(target).not.toHaveAttribute("unstyled");
        expect(target).toHaveAttribute("data-action", "primary");
        expect(target).toHaveAttribute("data-feedback", "ripple");
        expect(target).toHaveAttribute("data-reduced-motion");

        fireEvent.focus(target);
        expect(target.style.boxShadow).toBe("");
        fireEvent.click(target, { clientX: 1, clientY: 1 });
        expect(consumerClick).toHaveBeenCalledTimes(1);
        expect(childClick).toHaveBeenCalledTimes(mode === "asChild" ? 1 : 0);
        expect(target.querySelectorAll("span")).toHaveLength(1);
        vi.runAllTimers();
        expect(target.querySelectorAll("span")).toHaveLength(0);
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it.each([
    ["native", "disabled"],
    ["anchor", "disabled"],
    ["asChild", "disabled"],
    ["native", "loading"],
    ["anchor", "loading"],
    ["asChild", "loading"],
  ] as const)(
    "keeps unstyled %s %s activation and effects blocked",
    (mode, blockedState) => {
      const consumerClick = vi.fn();
      const childClick = vi.fn();
      const blocked =
        blockedState === "disabled" ? { disabled: true } : { loading: true };
      const common = {
        unstyled: true,
        className: `raw__blocked-${mode}`,
        dot: "m-2",
        style: { color: "purple" },
        rippleEffect: true,
        onClick: consumerClick,
        ...blocked,
      };

      render(
        mode === "native" ? (
          <Action {...common}>Native blocked</Action>
        ) : mode === "anchor" ? (
          <Action {...common} href="#blocked">
            Anchor blocked
          </Action>
        ) : (
          <Action {...common} asChild>
            <a href="#blocked" onClick={childClick}>
              Child blocked
            </a>
          </Action>
        ),
      );
      const target = screen.getByRole(mode === "native" ? "button" : "link");
      const createElement = vi.spyOn(document, "createElement");

      try {
        expect(target.className.match(/raw__blocked-/g)).toHaveLength(1);
        expect(target).not.toHaveClass("hua-action");
        expect(target.style.cursor).toBe("");
        expect(target.style.opacity).toBe("");
        expect(target.style.margin).not.toBe("");
        expect(target.style.color).toBe("purple");
        expect(target.getAttribute("style")).not.toContain("--action-");
        expect(target).not.toHaveAttribute("unstyled");

        fireEvent.click(target);
        expect(consumerClick).not.toHaveBeenCalled();
        expect(childClick).not.toHaveBeenCalled();
        expect(
          createElement.mock.calls.filter(([tag]) => tag === "span"),
        ).toHaveLength(0);
        if (blockedState === "loading") {
          expect(screen.getByRole("status")).toHaveTextContent("로딩 중");
          expect(target).toHaveAttribute("aria-busy", "true");
        }
        expect(target).toHaveAttribute("aria-disabled", "true");
      } finally {
        createElement.mockRestore();
      }
    },
  );

  it.each(["disabled", "loading"] as const)(
    "guards inherited asChild %s capture before Action and child callbacks",
    (blockedState) => {
      const actionCapture = vi.fn();
      const childCapture = vi.fn();
      render(
        <Action
          asChild
          unstyled
          onClickCapture={actionCapture}
          {...(blockedState === "disabled"
            ? { disabled: true }
            : { loading: true })}
        >
          <a href="#blocked-capture" onClickCapture={childCapture}>
            Blocked Action capture
          </a>
        </Action>,
      );

      const click = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      screen.getByRole("link").dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(actionCapture).not.toHaveBeenCalled();
      expect(childCapture).not.toHaveBeenCalled();
    },
  );

  it("composes enabled inherited asChild capture parent-first exactly once", () => {
    const order: string[] = [];
    render(
      <Action asChild unstyled onClickCapture={() => order.push("action")}>
        <a href="#enabled-capture" onClickCapture={() => order.push("child")}>
          Enabled Action capture
        </a>
      </Action>,
    );

    fireEvent.click(screen.getByRole("link"));
    expect(order).toEqual(["action", "child"]);
  });

  it.each(["disabled", "loading"] as const)(
    "guards inherited href %s capture before the Action callback",
    (blockedState) => {
      const capture = vi.fn();
      render(
        <Action
          href="#blocked-href-capture"
          unstyled
          onClickCapture={capture}
          {...(blockedState === "disabled"
            ? { disabled: true }
            : { loading: true })}
        >
          Blocked href capture
        </Action>,
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

  it("keeps inherited enabled href capture exactly once", () => {
    const capture = vi.fn();
    render(
      <Action href="#enabled-href-capture" unstyled onClickCapture={capture}>
        Enabled href capture
      </Action>,
    );

    fireEvent.click(screen.getByRole("link"));
    expect(capture).toHaveBeenCalledTimes(1);
  });

  it("keeps explicit Action style final over requested hover and clears held feedback when disabled", () => {
    const renderAction = (disabled = false) => (
      <Action
        asChild
        unstyled
        hover="scale"
        disabled={disabled}
        style={{ transform: "rotate(12deg)" }}
      >
        <a href="#action-precedence">Action precedence</a>
      </Action>
    );

    const { rerender } = render(renderAction());
    const target = screen.getByRole("link");
    fireEvent.mouseEnter(target);
    expect(target.style.transform).toBe("rotate(12deg)");

    rerender(renderAction(true));
    expect(target.style.transform).toBe("rotate(12deg)");

    rerender(renderAction());
    expect(target.style.transform).toBe("rotate(12deg)");
  });

  it("suppresses held Action hover across a disabled transition", () => {
    const renderAction = (disabled = false) => (
      <Action asChild unstyled hover="scale" disabled={disabled}>
        <a href="#action-disabled-transition">Action disabled transition</a>
      </Action>
    );

    const { rerender } = render(renderAction());
    const target = screen.getByRole("link");
    fireEvent.mouseEnter(target);
    expect(target.style.transform).toBe("scale(1.015)");

    rerender(renderAction(true));
    expect(target.style.transform).toBe("");

    rerender(renderAction());
    expect(target.style.transform).toBe("");
  });
});
