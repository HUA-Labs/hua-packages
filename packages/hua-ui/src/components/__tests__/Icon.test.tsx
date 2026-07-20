import { afterEach, describe, it, expect, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
  Icon,
  EmotionIcon,
  StatusIcon,
  LoadingIcon,
  SuccessIcon,
  ErrorIcon,
} from "../Icon";
import { IconProvider } from "../Icon/IconProvider";
import {
  registerIconsaxResolver,
  registerLucideResolver,
} from "../../lib/icon-providers";

afterEach(() => {
  cleanup();
  registerLucideResolver(null);
  registerIconsaxResolver(null);
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Icon", () => {
  it("should render a span element", () => {
    const { container } = render(<Icon name="heart" />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
  });

  it("should apply size via inline style", () => {
    const { container } = render(<Icon name="heart" size={32} />);
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ width: "32px", height: "32px" });
  });

  it("should apply string size", () => {
    const { container } = render(<Icon name="heart" size="2rem" />);
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ width: "2rem", height: "2rem" });
  });

  it("should apply dot prop styles", () => {
    const { container } = render(<Icon name="heart" dot="opacity-50" />);
    const span = container.querySelector("span");
    expect(span?.style.opacity).toBe("0.5");
  });

  it("should apply inline style prop", () => {
    const { container } = render(
      <Icon name="heart" style={{ margin: "10px" }} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ margin: "10px" });
  });

  it("rerenders when style and classDot change", async () => {
    const { container, rerender } = render(
      <Icon name="heart" style={{ marginLeft: 1 }} classDot="opacity-50" />,
    );
    await act(async () => {});
    const beforeClassName = container.firstElementChild?.className;

    rerender(
      <Icon name="heart" style={{ marginLeft: 9 }} classDot="opacity-75" />,
    );
    await act(async () => {});

    expect(container.firstElementChild).toHaveStyle({ marginLeft: "9px" });
    expect(container.firstElementChild?.className).not.toBe(beforeClassName);
  });

  it("reacts immediately when the selected Lucide resolver is registered", async () => {
    registerLucideResolver(null);
    const LucideHome = (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="lucide-home" {...props} />
    );
    const { container } = render(<Icon name="home" provider="lucide" />);
    await act(async () => {});

    expect(screen.queryByTestId("lucide-home")).toBeNull();
    expect(container.querySelector('span[title*="not found"]')).toBeNull();

    act(() => {
      registerLucideResolver((name) => (name === "Home" ? LucideHome : null));
    });

    expect(screen.getByTestId("lucide-home")).toBeInTheDocument();
  });

  it("does not rerender a Lucide icon for unrelated Iconsax changes", async () => {
    const renderCount = vi.fn();
    const LucideHome = (props: React.SVGProps<SVGSVGElement>) => {
      renderCount();
      return <svg data-testid="stable-lucide-home" {...props} />;
    };
    registerLucideResolver((name) => (name === "Home" ? LucideHome : null));
    render(<Icon name="home" provider="lucide" />);
    await act(async () => {});
    const before = renderCount.mock.calls.length;

    act(() => {
      registerIconsaxResolver(() => null);
    });

    expect(renderCount).toHaveBeenCalledTimes(before);
  });

  it("passes configurable strokeWidth only to capable Lucide icons", async () => {
    const received = vi.fn();
    const LucideHome = (props: React.SVGProps<SVGSVGElement>) => {
      received(props.strokeWidth);
      return <svg data-testid="stroke-lucide-home" {...props} />;
    };
    registerLucideResolver((name) => (name === "Home" ? LucideHome : null));

    render(
      <IconProvider set="lucide" strokeWidth={3}>
        <Icon name="home" />
      </IconProvider>,
    );
    await act(async () => {});

    expect(screen.getByTestId("stroke-lucide-home")).toBeInTheDocument();
    expect(received).toHaveBeenLastCalledWith(3);
  });

  it("does not advertise configurable strokeWidth to fixed-stroke Iconsax", async () => {
    const received = vi.fn();
    const IconsaxHome = (props: React.SVGProps<SVGSVGElement>) => {
      received(props);
      return <svg data-testid="fixed-iconsax-home" {...props} />;
    };
    registerIconsaxResolver((name) => (name === "Home2" ? IconsaxHome : null));

    render(
      <IconProvider set="iconsax" strokeWidth={4}>
        <Icon name="home" />
      </IconProvider>,
    );
    await act(async () => {});

    expect(screen.getByTestId("fixed-iconsax-home")).toBeInTheDocument();
    expect(received).toHaveBeenCalled();
    expect(received.mock.lastCall?.[0]).not.toHaveProperty("strokeWidth");
  });

  it("should show fallback when icon not found", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Icon name={"nonexistent-icon" as never} />);

    // After useEffect runs, icon should show fallback
    await act(async () => {});
    const fallback = container.querySelector('span[title*="not found"]');
    expect(fallback).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it.each(["constructor", "toString", "hasOwnProperty", "__proto__"])(
    "renders bounded fallback for inherited object key %s",
    async (name) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container } = render(<Icon name={name as never} />);

      await act(async () => {});

      expect(
        container.querySelector('span[title*="not found"]'),
      ).toBeInTheDocument();
      warn.mockRestore();
    },
  );

  it.each(["layout-dashboard", "play", "github", "moreVertical"] as const)(
    "renders catalog-backed default icon %s",
    async (name) => {
      const { container } = render(<Icon name={name} />);

      await act(async () => {});

      expect(container.querySelector('span[title*="not found"]')).toBeNull();
      expect(container.querySelector("svg")).toBeInTheDocument();
    },
  );

  it.each(["mapPin", "alignLeft", "underline"] as const)(
    "renders the M751 consumer icon %s through static Phosphor",
    async (name) => {
      const { container } = render(<Icon name={name} />);

      await act(async () => {});

      expect(container.querySelector('span[title*="not found"]')).toBeNull();
      expect(container.querySelector("svg")).toBeInTheDocument();
    },
  );

  it("keeps mapPin explicitly unsupported in Iconsax and falls back without probing the resolver", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const resolver = vi.fn(() => null);
    registerIconsaxResolver(resolver);

    const { container } = render(<Icon name="mapPin" provider="iconsax" />);
    await act(async () => {});

    expect(resolver).not.toHaveBeenCalled();
    expect(container.querySelector('span[title*="not found"]')).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Icon "mapPin" is explicitly unsupported for provider "iconsax"',
      ),
    );
  });

  it("resolves alignLeft and underline through exact full Iconsax members", async () => {
    const TextalignLeft = (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="iconsax-align-left" {...props} />
    );
    const TextUnderline = (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="iconsax-underline" {...props} />
    );
    const resolver = vi.fn((name: string) =>
      name === "TextalignLeft"
        ? TextalignLeft
        : name === "TextUnderline"
          ? TextUnderline
          : null,
    );
    registerIconsaxResolver(resolver);

    render(
      <>
        <Icon name="alignLeft" provider="iconsax" />
        <Icon name="underline" provider="iconsax" />
      </>,
    );
    await act(async () => {});

    expect(screen.getByTestId("iconsax-align-left")).toBeInTheDocument();
    expect(screen.getByTestId("iconsax-underline")).toBeInTheDocument();
    expect(resolver).toHaveBeenCalledWith("TextalignLeft", "line");
    expect(resolver).toHaveBeenCalledWith("TextUnderline", "line");
  });

  it("resolves the three M751 literals through exact Lucide members", async () => {
    const components = {
      MapPin: (props: React.SVGProps<SVGSVGElement>) => (
        <svg data-testid="lucide-map-pin" {...props} />
      ),
      AlignLeft: (props: React.SVGProps<SVGSVGElement>) => (
        <svg data-testid="lucide-align-left" {...props} />
      ),
      Underline: (props: React.SVGProps<SVGSVGElement>) => (
        <svg data-testid="lucide-underline" {...props} />
      ),
    };
    const resolver = vi.fn(
      (name: string) => components[name as keyof typeof components] ?? null,
    );
    registerLucideResolver(resolver);

    render(
      <>
        <Icon name="mapPin" provider="lucide" />
        <Icon name="alignLeft" provider="lucide" />
        <Icon name="underline" provider="lucide" />
      </>,
    );
    await act(async () => {});

    expect(screen.getByTestId("lucide-map-pin")).toBeInTheDocument();
    expect(screen.getByTestId("lucide-align-left")).toBeInTheDocument();
    expect(screen.getByTestId("lucide-underline")).toBeInTheDocument();
    expect(resolver).toHaveBeenCalledWith("MapPin");
    expect(resolver).toHaveBeenCalledWith("AlignLeft");
    expect(resolver).toHaveBeenCalledWith("Underline");
  });

  it.each(["mapPin", "alignLeft", "underline"] as const)(
    "falls back to Phosphor when the Lucide resolver is absent for %s",
    async (name) => {
      const { container } = render(<Icon name={name} provider="lucide" />);
      await act(async () => {});

      expect(container.querySelector('span[title*="not found"]')).toBeNull();
      expect(container.querySelector("svg")).toBeInTheDocument();
    },
  );

  it.each(["upload", "download", "bell", "rocket"] as const)(
    "falls back to verified Phosphor for unsupported Iconsax icon %s",
    async (name) => {
      vi.stubEnv("NODE_ENV", "development");
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container } = render(<Icon name={name} provider="iconsax" />);

      await act(async () => {});

      expect(container.querySelector('span[title*="not found"]')).toBeNull();
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("falling back to Phosphor"),
      );
      warn.mockRestore();
      vi.unstubAllEnvs();
    },
  );

  it("keeps unknown dynamic Lucide names bounded instead of guessing PascalCase", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const resolver = vi.fn(() => null);
    registerLucideResolver(resolver);
    const { container } = render(
      <Icon name={"future-widget" as never} provider="lucide" />,
    );

    await act(async () => {});

    expect(container.querySelector('span[title*="not found"]')).toBeTruthy();
    expect(resolver).not.toHaveBeenCalled();
  });

  it("directs an absent Lucide resolver to the retained root registration API", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Icon name={"future-widget" as never} provider="lucide" />);
    await act(async () => {});

    const expectedWarning =
      'Icon "futureWidget" — lucide resolver not registered. ' +
      'Register a compatible resolver with registerLucideResolver(...) before using provider="lucide".';
    expect(warn).toHaveBeenCalledWith(expectedWarning);

    const warning = warn.mock.calls.flat().join("\n");
    expect(warning).toContain("registerLucideResolver(...)");
    expect(warning).not.toMatch(
      /@hua-labs\/ui\/lucide|\bimport\b|\binstall\b|lucide-react|\bunavailable\b|\bavailable\b/i,
    );
  });

  it("keeps the absent Lucide resolver warning development-only", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Icon name={"future-widget" as never} provider="lucide" />);
    await act(async () => {});

    expect(warn).not.toHaveBeenCalled();
  });

  it("should be hidden from screen readers by default", () => {
    const { container } = render(<Icon name="heart" />);
    const span = container.querySelector("span");
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("should be visible to screen readers when aria-label is set", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Icon name="heart" aria-label="Favorite" />);
    await act(async () => {});
    const span = container.querySelector('span[aria-label="Favorite"]');
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("aria-hidden", "false");
    vi.restoreAllMocks();
  });

  it("should apply spin animation style", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Icon name="loader" spin />);
    await act(async () => {});
    const span = container.querySelector("span");
    // animate-spin → animation style via dot engine
    expect(span?.getAttribute("style")).toContain("animation");
    vi.restoreAllMocks();
  });

  it("should apply variant color styles", () => {
    const { container } = render(<Icon name="heart" variant="primary" />);
    const span = container.querySelector("span");
    // text-primary → dot resolves to color: var(--color-primary)
    expect(span).toBeInTheDocument();
    expect(span?.getAttribute("style")).toContain("var(--color-primary)");
  });
});

describe("EmotionIcon", () => {
  it("should render with emotion prop", () => {
    const { container } = render(<EmotionIcon emotion="happy" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});

describe("StatusIcon", () => {
  it("should render with status prop", () => {
    const { container } = render(<StatusIcon status="success" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});

describe("LoadingIcon", () => {
  it("should render with loading defaults", () => {
    const { container } = render(<LoadingIcon />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("aria-label", "로딩 중");
  });
});

describe("SuccessIcon", () => {
  it("should render with success defaults", () => {
    const { container } = render(<SuccessIcon />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("aria-label", "성공");
  });
});

describe("ErrorIcon", () => {
  it("should render with error defaults", () => {
    const { container } = render(<ErrorIcon />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("aria-label", "오류");
  });
});

describe("IconProvider", () => {
  it("should provide size context to Icon", () => {
    const { container } = render(
      <IconProvider size={48}>
        <Icon name="heart" />
      </IconProvider>,
    );
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("should allow Icon to override provider size", () => {
    const { container } = render(
      <IconProvider size={48}>
        <Icon name="heart" size={16} />
      </IconProvider>,
    );
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ width: "16px", height: "16px" });
  });

  it("should provide default config when no provider", () => {
    const { container } = render(<Icon name="heart" />);
    // Default size from defaultIconConfig (20)
    const span = container.querySelector("span");
    expect(span).toHaveStyle({ width: "20px", height: "20px" });
  });
});
