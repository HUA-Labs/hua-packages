import React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Tooltip, TooltipLight, TooltipDark } from "../Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render children", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(
      screen.getByRole("button", { name: "Hover me" }),
    ).toBeInTheDocument();
  });

  it("uses the single trigger as the keyboard focus owner and preserves describedby tokens", () => {
    render(
      <Tooltip content="Keyboard help" delay={0}>
        <button aria-describedby="existing-help">Focus me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button", { name: "Focus me" });
    fireEvent.focus(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Keyboard help");
    expect(button.getAttribute("aria-describedby")?.split(/\s+/)).toEqual([
      "existing-help",
      tooltip.id,
    ]);

    const wrapper = button.parentElement;
    expect(wrapper).not.toHaveAttribute("tabindex");
  });

  it("binds its generated describedby token only while the tooltip target is visible", () => {
    const childKeyDown = vi.fn();
    const { rerender } = render(
      <Tooltip content="Lifecycle help" delay={0}>
        <button
          aria-describedby="consumer-one consumer-two"
          onKeyDown={childKeyDown}
        >
          Lifecycle trigger
        </button>
      </Tooltip>,
    );

    const button = screen.getByRole("button", { name: "Lifecycle trigger" });
    expect(button).toHaveAttribute(
      "aria-describedby",
      "consumer-one consumer-two",
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    act(() => button.focus());
    act(() => vi.advanceTimersByTime(0));

    const tooltip = screen.getByRole("tooltip");
    expect(button.getAttribute("aria-describedby")?.split(/\s+/)).toEqual([
      "consumer-one",
      "consumer-two",
      tooltip.id,
    ]);
    expect(document.getElementById(tooltip.id)).toBe(tooltip);

    fireEvent.keyDown(button, { key: "Escape" });
    expect(childKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(button).toHaveAttribute(
      "aria-describedby",
      "consumer-one consumer-two",
    );
    expect(document.activeElement).toBe(button);

    fireEvent.mouseEnter(button);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    rerender(
      <Tooltip content="Lifecycle help" delay={0} disabled>
        <button aria-describedby="consumer-one consumer-two">
          Lifecycle trigger
        </button>
      </Tooltip>,
    );
    expect(button).toHaveAttribute(
      "aria-describedby",
      "consumer-one consumer-two",
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it.each(["mouse leave", "blur"] as const)(
    "does not resurrect a pending relationship after %s",
    (exit) => {
      render(
        <Tooltip content="Delayed help" delay={500}>
          <button aria-describedby="consumer-help">Delayed trigger</button>
        </Tooltip>,
      );

      const button = screen.getByRole("button", { name: "Delayed trigger" });
      if (exit === "mouse leave") {
        fireEvent.mouseEnter(button);
      } else {
        act(() => button.focus());
      }
      act(() => vi.advanceTimersByTime(200));

      if (exit === "mouse leave") {
        fireEvent.mouseLeave(button);
      } else {
        fireEvent.blur(button);
      }
      act(() => vi.advanceTimersByTime(500));

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      expect(button).toHaveAttribute("aria-describedby", "consumer-help");
    },
  );

  it("keeps initial SSR bytes target-free and hydrates the relationship on focus", async () => {
    const element = (
      <Tooltip content="Hydrated help" delay={0}>
        <button aria-describedby="server-help">Hydrate trigger</button>
      </Tooltip>
    );
    const serverMarkup = renderToString(element);
    expect(serverMarkup).toContain('aria-describedby="server-help"');
    expect(serverMarkup).not.toContain("-tooltip");

    const container = document.createElement("div");
    container.innerHTML = serverMarkup;
    document.body.append(container);
    const serverButton = container.querySelector("button");
    const recoverable = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError: recoverable,
        });
        await Promise.resolve();
      });

      const hydratedButton = container.querySelector("button");
      expect(hydratedButton).toBe(serverButton);
      expect(hydratedButton).toHaveAttribute("aria-describedby", "server-help");
      expect(container.querySelector('[role="tooltip"]')).toBeNull();
      expect(recoverable).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();

      act(() => hydratedButton?.focus());
      act(() => vi.advanceTimersByTime(0));

      const tooltip = container.querySelector('[role="tooltip"]');
      expect(tooltip).not.toBeNull();
      expect(
        hydratedButton?.getAttribute("aria-describedby")?.split(/\s+/),
      ).toEqual(["server-help", tooltip?.id]);
      expect(document.activeElement).toBe(hydratedButton);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
      consoleError.mockRestore();
    }
  });

  it("keeps the tooltip open while either hover or focus remains active", () => {
    render(
      <Tooltip content="Persistent help" delay={0}>
        <button>Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    fireEvent.focus(button);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.mouseLeave(button);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.blur(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("composes trigger and tooltip handlers and refs exactly once", () => {
    const childFocus = vi.fn();
    const tooltipFocus = vi.fn();
    const childMouseEnter = vi.fn();
    const tooltipMouseEnter = vi.fn();
    const childRef = React.createRef<HTMLButtonElement>();

    render(
      <Tooltip
        content="Composed help"
        delay={0}
        onFocus={tooltipFocus}
        onMouseEnter={tooltipMouseEnter}
      >
        <button
          ref={childRef}
          onFocus={childFocus}
          onMouseEnter={childMouseEnter}
        >
          Trigger
        </button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.focus(button);
    fireEvent.mouseEnter(button);

    expect(childRef.current).toBe(button);
    expect(childFocus).toHaveBeenCalledTimes(1);
    expect(tooltipFocus).toHaveBeenCalledTimes(1);
    expect(childMouseEnter).toHaveBeenCalledTimes(1);
    expect(tooltipMouseEnter).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Composed help");
  });

  it("runs cleanup returned by the trigger callback ref exactly once", () => {
    const mounted = vi.fn();
    const cleanup = vi.fn();
    const nulled = vi.fn();
    const callbackRef: React.RefCallback<HTMLButtonElement> = (node) => {
      if (node) {
        mounted();
        return cleanup;
      }

      nulled();
    };

    const { unmount } = render(
      <Tooltip content="Cleanup help">
        <button ref={callbackRef}>Trigger</button>
      </Tooltip>,
    );

    expect(mounted).toHaveBeenCalledTimes(1);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(nulled).not.toHaveBeenCalled();
  });

  it("preserves legacy text children through a consumer-focusable wrapper", () => {
    const tooltipFocus = vi.fn();
    const { container } = render(
      <Tooltip
        content="Legacy text help"
        delay={0}
        tabIndex={0}
        onFocus={tooltipFocus}
      >
        text trigger
      </Tooltip>,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveTextContent("text trigger");
    expect(wrapper).toHaveAttribute("tabindex", "0");
    expect(wrapper).not.toHaveAttribute("aria-describedby");

    act(() => wrapper.focus());
    act(() => vi.advanceTimersByTime(0));

    const tooltip = screen.getByRole("tooltip");
    expect(tooltipFocus).toHaveBeenCalledTimes(1);
    expect(wrapper).toHaveAttribute("aria-describedby", tooltip.id);

    fireEvent.keyDown(wrapper, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("aria-describedby");
    expect(document.activeElement).toBe(wrapper);
  });

  it("preserves fragment children without adding a wrapper tab stop or false descendant IDREF", () => {
    const childFocus = vi.fn();
    const tooltipFocus = vi.fn();
    const { container } = render(
      <Tooltip content="Legacy group help" delay={0} onFocus={tooltipFocus}>
        <>
          <button onFocus={childFocus}>First trigger</button>
          <span>Second trigger</span>
        </>
      </Tooltip>,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    const button = screen.getByRole("button", { name: "First trigger" });
    expect(wrapper).not.toHaveAttribute("tabindex");

    act(() => button.focus());
    act(() => vi.advanceTimersByTime(0));
    expect(childFocus).toHaveBeenCalledTimes(1);
    expect(tooltipFocus).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(wrapper).not.toHaveAttribute("aria-describedby");

    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Legacy group help");
  });

  it("unwraps one renderable element from fragment and array compatibility shapes", () => {
    const fragmentRef = React.createRef<HTMLButtonElement>();
    const { rerender } = render(
      <Tooltip content="Fragment help" delay={0}>
        <>
          {false}
          {""}
          <button ref={fragmentRef} aria-describedby="fragment-existing">
            Fragment trigger
          </button>
          {null}
        </>
      </Tooltip>,
    );

    const fragmentButton = screen.getByRole("button", {
      name: "Fragment trigger",
    });
    expect(fragmentRef.current).toBe(fragmentButton);
    expect(fragmentButton.parentElement).not.toHaveAttribute("tabindex");
    act(() => fragmentButton.focus());
    act(() => vi.advanceTimersByTime(0));

    const fragmentTooltip = screen.getByRole("tooltip");
    expect(
      fragmentButton.getAttribute("aria-describedby")?.split(/\s+/),
    ).toEqual(["fragment-existing", fragmentTooltip.id]);
    fireEvent.keyDown(fragmentButton, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(
      <Tooltip content="Array help" delay={0}>
        {[null, "", <button key="array">Array trigger</button>, false]}
      </Tooltip>,
    );

    const arrayButton = screen.getByRole("button", { name: "Array trigger" });
    expect(arrayButton.parentElement).not.toHaveAttribute("tabindex");
    act(() => arrayButton.focus());
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Array help");

    fireEvent.keyDown(arrayButton, { key: "Escape" });
    rerender(
      <Tooltip content="Whitespace group help" delay={0}>
        {[" ", <button key="whitespace">Whitespace trigger</button>]}
      </Tooltip>,
    );

    const whitespaceButton = screen.getByRole("button", {
      name: "Whitespace trigger",
    });
    act(() => whitespaceButton.focus());
    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(whitespaceButton).not.toHaveAttribute("aria-describedby");

    const whitespaceWrapper = whitespaceButton.parentElement as HTMLElement;
    fireEvent.mouseEnter(whitespaceWrapper);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Whitespace group help",
    );
  });

  it("keeps empty compatibility children inert", () => {
    const tooltipMouseEnter = vi.fn();
    const { container } = render(
      <Tooltip content="No trigger" delay={0} onMouseEnter={tooltipMouseEnter}>
        {[null, false, undefined, ""]}
      </Tooltip>,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeEmptyDOMElement();
    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(0));
    expect(tooltipMouseEnter).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("aria-describedby");
  });

  it("does not resurrect visibility when trigger ownership changes", () => {
    const { container, rerender } = render(
      <Tooltip content="Owned help" delay={0}>
        <button>Owned trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Owned trigger" });
    act(() => trigger.focus());
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Owned help");

    rerender(
      <Tooltip content="No trigger" delay={0}>
        {[null, false]}
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(
      <Tooltip content="Grouped help" delay={0}>
        <button>First grouped trigger</button>
        <button>Second grouped trigger</button>
      </Tooltip>,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("aria-describedby");

    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Grouped help");
  });

  it("should not show tooltip initially", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should show tooltip on mouse enter after delay", () => {
    render(
      <Tooltip content="Tooltip text" delay={300}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    // Advance timers and run effects
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should hide tooltip on mouse leave", () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();

    fireEvent.mouseLeave(button);

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should not show tooltip when disabled", () => {
    render(
      <Tooltip content="Tooltip text" disabled={true}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should render with default variant using inline background style", () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText("Tooltip text");
    // default variant uses a dark gray background
    expect(tooltip.style.backgroundColor).toBeTruthy();
  });

  it("should render with light variant having popover background", () => {
    render(
      <Tooltip content="Tooltip text" variant="light" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText("Tooltip text");
    // light variant uses CSS variable for background
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.style.border).toBeTruthy();
  });

  it("should render with dark variant using dark background", () => {
    render(
      <Tooltip content="Tooltip text" variant="dark" delay={0}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText("Tooltip text");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.style.backgroundColor).toBeTruthy();
  });

  it("should render with custom delay", () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    // Should not show before delay
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();

    // Should show after delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should cancel tooltip show if mouse leaves before delay", () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.mouseLeave(button);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should apply dot prop styles to wrapper element", () => {
    const { container } = render(
      <Tooltip content="Tooltip text" dot="p-4">
        <button>Hover me</button>
      </Tooltip>,
    );

    // The wrapper div should have inline styles from dot resolution
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe("DIV");
  });

  it("should apply style prop to wrapper element", () => {
    const { container } = render(
      <Tooltip content="Tooltip text" style={{ opacity: 0.9 }}>
        <button>Hover me</button>
      </Tooltip>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0.9");
  });
});

describe("TooltipLight", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render with light variant", () => {
    render(
      <TooltipLight content="Light tooltip" delay={0}>
        <button>Hover me</button>
      </TooltipLight>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText("Light tooltip");
    expect(tooltip).toBeInTheDocument();
    // light variant renders a border
    expect(tooltip.style.border).toBeTruthy();
  });
});

describe("TooltipDark", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render with dark variant", () => {
    render(
      <TooltipDark content="Dark tooltip" delay={0}>
        <button>Hover me</button>
      </TooltipDark>,
    );

    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText("Dark tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.style.backgroundColor).toBeTruthy();
  });
});
