import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  FadeTransition,
  FlipTransition,
  PageTransition,
  ScaleTransition,
  SlideTransition,
} from "../PageTransition";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { createRef } from "react";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PageTransition", () => {
  it("should show loading state initially", () => {
    render(<PageTransition>Content</PageTransition>);

    expect(screen.getByText("페이지 로딩 중...")).toBeInTheDocument();
  });

  it("should show custom loading text", () => {
    render(
      <PageTransition loadingText="Please wait...">Content</PageTransition>,
    );

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("should show content after duration", () => {
    render(<PageTransition duration={300}>Page Content</PageTransition>);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("should not show loading when showLoading is false", () => {
    render(
      <PageTransition showLoading={false}>Immediate Content</PageTransition>,
    );

    // Content should be visible even during loading phase
    expect(screen.queryByText("페이지 로딩 중...")).not.toBeInTheDocument();
  });

  it("should call onTransitionStart", () => {
    const handleStart = vi.fn();

    render(
      <PageTransition onTransitionStart={handleStart}>Content</PageTransition>,
    );

    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it("should call onTransitionEnd after duration", () => {
    const handleEnd = vi.fn();

    render(
      <PageTransition duration={200} onTransitionEnd={handleEnd}>
        Content
      </PageTransition>,
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(handleEnd).toHaveBeenCalledTimes(1);
  });

  it("should apply fade variant with transition-property style", () => {
    const { container } = render(
      <PageTransition variant="fade" showLoading={false}>
        Content
      </PageTransition>,
    );

    const wrapper = container.firstChild as HTMLElement;
    // fade resolves to transitionProperty: opacity
    expect(wrapper.style.transitionProperty).toBe("opacity");
  });

  it("should apply slide variant with transition-property style", () => {
    const { container } = render(
      <PageTransition variant="slide" showLoading={false}>
        Content
      </PageTransition>,
    );

    const wrapper = container.firstChild as HTMLElement;
    // slide resolves to transitionProperty: transform
    expect(wrapper.style.transitionProperty).toBe("transform");
  });

  it("should forward additional style via dot prop", () => {
    const { container } = render(
      <PageTransition dot="opacity-50" showLoading={false}>
        Content
      </PageTransition>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0.5");
  });

  it("should set transition duration style", () => {
    const { container } = render(
      <PageTransition duration={500} showLoading={false}>
        Content
      </PageTransition>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transitionDuration).toBe("500ms");
  });

  it("keeps one opaque class across loading and content shell ownership", () => {
    const rawClassName = "legacy-transition  css-module_hash";
    const ref = createRef<HTMLDivElement>();
    const onTransitionStart = vi.fn();
    const onTransitionEnd = vi.fn();
    const { container } = render(
      <PageTransition
        ref={ref}
        className={rawClassName}
        unstyled
        duration={120}
        loadingText="Loading phase"
        onTransitionStart={onTransitionStart}
        onTransitionEnd={onTransitionEnd}
      >
        Content phase
      </PageTransition>,
    );

    const loadingRoot = container.firstElementChild as HTMLElement;
    expect(loadingRoot.getAttribute("class")).toBe(rawClassName);
    expect(loadingRoot.style.display).toBe("");
    expect(loadingRoot.style.minHeight).toBe("");
    expect(loadingRoot.style.backgroundImage).toBe("");
    expect(screen.getByText("Loading phase")).toBeInTheDocument();
    expect(ref.current).toBeNull();
    expect(onTransitionStart).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(120);
    });

    const contentRoot = container.firstElementChild as HTMLElement;
    expect(contentRoot).toBe(loadingRoot);
    expect(contentRoot.getAttribute("class")).toBe(rawClassName);
    expect(contentRoot.style.width).toBe("");
    expect(contentRoot.style.transitionProperty).toBe("opacity");
    expect(contentRoot.style.transitionDuration).toBe("120ms");
    expect(ref.current).toBe(contentRoot);
    expect(onTransitionEnd).toHaveBeenCalledTimes(1);
    expect(contentRoot).not.toHaveAttribute("unstyled");
  });

  it("hydrates the unstyled content shell onto the existing server node", async () => {
    const rawClassName = "legacy-transition  css-module_hash";
    const element = (
      <PageTransition
        className={rawClassName}
        unstyled
        showLoading={false}
        duration={1000}
      >
        Hydrated content
      </PageTransition>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    const serverNode = container.firstElementChild;
    const recoverable = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError: recoverable,
        });
      });
      expect(container.firstElementChild).toBe(serverNode);
      expect(container.firstElementChild?.getAttribute("class")).toBe(
        rawClassName,
      );
      expect((container.firstElementChild as HTMLElement).style.width).toBe("");
      expect(recoverable).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      if (root) {
        await act(async () => root?.unmount());
      }
      consoleError.mockRestore();
    }
  });

  it("inherits the compatibility shell through convenience variants", () => {
    const { container } = render(
      <>
        <FadeTransition className="fade-compat" unstyled showLoading={false}>
          Fade
        </FadeTransition>
        <SlideTransition className="slide-compat" unstyled showLoading={false}>
          Slide
        </SlideTransition>
        <ScaleTransition className="scale-compat" unstyled showLoading={false}>
          Scale
        </ScaleTransition>
        <FlipTransition className="flip-compat" unstyled showLoading={false}>
          Flip
        </FlipTransition>
      </>,
    );

    const roots = Array.from(container.children) as HTMLElement[];
    expect(roots.map((root) => root.className)).toEqual([
      "fade-compat",
      "slide-compat",
      "scale-compat",
      "flip-compat",
    ]);
    expect(roots.every((root) => root.style.width === "")).toBe(true);
    expect(roots.map((root) => root.style.transitionProperty)).toEqual([
      "opacity",
      "transform",
      "all",
      "all",
    ]);
  });
});
