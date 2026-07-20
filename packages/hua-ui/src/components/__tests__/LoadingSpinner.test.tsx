import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render spinner with animate-spin style", () => {
    const { container } = render(<LoadingSpinner />);

    // dot resolves animate-spin -> animation: spin 1s linear infinite
    const spinner = container.querySelector('[style*="spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it("should apply size variants via inline style", () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    // sm: w-6 h-6 -> width: 24px, height: 24px
    const sizeDiv = container.querySelector('[style*="24px"]');
    expect(sizeDiv).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    // lg: w-12 h-12 -> width: 48px, height: 48px
    const lgDiv = container.querySelector('[style*="48px"]');
    expect(lgDiv).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    // xl: w-16 h-16 -> width: 64px, height: 64px
    const xlDiv = container.querySelector('[style*="64px"]');
    expect(xlDiv).toBeInTheDocument();
  });

  it("should display text", () => {
    render(<LoadingSpinner text="Loading..." />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should not display text by default", () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("should render dots variant with 3 dot elements", () => {
    const { container } = render(<LoadingSpinner variant="dots" />);

    // dots render 3 divs with animation: dotPulse inside a flex container
    const dots = container.querySelectorAll('[style*="dotPulse"]');
    expect(dots.length).toBe(3);
  });

  it("should render bars variant with 5 bar elements", () => {
    const { container } = render(<LoadingSpinner variant="bars" />);

    // bars render 5 divs with animation: barWave inside a flex container
    const bars = container.querySelectorAll('[style*="barWave"]');
    expect(bars.length).toBe(5);
  });

  it("should render ring variant with spin animation", () => {
    const { container } = render(<LoadingSpinner variant="ring" />);

    const spinner = container.querySelector('[style*="spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it("should render ripple variant with ping animation", () => {
    const { container } = render(<LoadingSpinner variant="ripple" />);

    const pingEl = container.querySelector('[style*="ping"]');
    expect(pingEl).toBeInTheDocument();
  });

  it("should apply color variants via inline style", () => {
    const { container, rerender } = render(<LoadingSpinner color="primary" />);
    // primary color applies border styles to the spinner element
    const spinnerEl = container.querySelector('[style*="border"]');
    expect(spinnerEl).toBeInTheDocument();

    rerender(<LoadingSpinner color="success" />);
    // success color also applies border styles (green tones)
    const successEl = container.querySelector('[style*="border"]');
    expect(successEl).toBeInTheDocument();
  });

  it("should forward additional style via dot prop", () => {
    const { container } = render(<LoadingSpinner dot="opacity-50" />);

    const wrapper = container.querySelector("div");
    expect(wrapper?.style.opacity).toBe("0.5");
  });

  it("keeps opaque wrapper classes without stripping indicator visuals", () => {
    const rawClassName = "legacy-spinner  css-module_hash";
    const { container } = render(
      <>
        <style>{`.legacy-spinner { display: grid; align-items: start; }`}</style>
        <LoadingSpinner
          className={rawClassName}
          unstyled
          size="sm"
          variant="ring"
          text="Loading"
          dot="opacity-50"
          style={{ paddingTop: "3px" }}
        />
      </>,
    );

    const root = container.querySelector(".legacy-spinner") as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("class")).toBe(rawClassName);
    expect(getComputedStyle(root).display).toBe("grid");
    expect(getComputedStyle(root).alignItems).toBe("start");
    expect(root.style.opacity).toBe("0.5");
    expect(root.style.paddingTop).toBe("3px");

    const indicatorWrapper = root.firstElementChild as HTMLElement;
    expect(indicatorWrapper.style.width).toBe("24px");
    expect(indicatorWrapper.style.height).toBe("24px");
    expect(
      indicatorWrapper.querySelector('[style*="spin"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(root).not.toHaveAttribute("unstyled");
  });
});
