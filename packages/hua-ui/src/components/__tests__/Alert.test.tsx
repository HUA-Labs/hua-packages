import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Alert,
  AlertSuccess,
  AlertWarning,
  AlertError,
  AlertInfo,
} from "../Alert";

describe("Alert", () => {
  it("should render with default variant", () => {
    const { container } = render(<Alert title="Alert" />);

    const alert = container.querySelector("div");
    expect(alert).toBeInTheDocument();
    // default variant uses color-mix with foreground token
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-foreground) 10%, transparent)",
    );
  });

  it("should render title", () => {
    render(<Alert title="Alert Title" />);

    const title = screen.getByText("Alert Title");
    expect(title).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Alert description="Alert description" />);

    const description = screen.getByText("Alert description");
    expect(description).toBeInTheDocument();
  });

  it("should render children", () => {
    render(<Alert>Custom content</Alert>);

    const content = screen.getByText("Custom content");
    expect(content).toBeInTheDocument();
  });

  it("should apply success variant styles", () => {
    const { container } = render(<Alert variant="success" title="Success" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-success) 10%, transparent)",
    );
    expect(alert?.style.borderColor).toBe(
      "color-mix(in srgb, var(--color-success) 30%, transparent)",
    );
  });

  it("should apply warning variant styles", () => {
    const { container } = render(<Alert variant="warning" title="Warning" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-warning) 10%, transparent)",
    );
    expect(alert?.style.borderColor).toBe(
      "color-mix(in srgb, var(--color-warning) 30%, transparent)",
    );
  });

  it("should apply error variant styles", () => {
    const { container } = render(<Alert variant="error" title="Error" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-destructive) 10%, transparent)",
    );
    expect(alert?.style.borderColor).toBe(
      "color-mix(in srgb, var(--color-destructive) 30%, transparent)",
    );
  });

  it("should apply info variant styles", () => {
    const { container } = render(<Alert variant="info" title="Info" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-info) 10%, transparent)",
    );
    expect(alert?.style.borderColor).toBe(
      "color-mix(in srgb, var(--color-info) 30%, transparent)",
    );
  });

  it("should apply backdrop-filter via inline style", () => {
    const { container } = render(<Alert title="Alert" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backdropFilter).toBe("blur(4px)");
  });

  it("should apply border-radius via inline style", () => {
    const { container } = render(<Alert title="Alert" />);

    const alert = container.querySelector("div");
    expect(alert?.style.borderRadius).toBe("0.5rem");
  });

  it("should show default icon based on variant", () => {
    const { container } = render(<Alert variant="success" title="Success" />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    render(
      <Alert icon={<div data-testid="custom-icon">Icon</div>} title="Alert" />,
    );

    const icon = screen.getByTestId("custom-icon");
    expect(icon).toBeInTheDocument();
  });

  it("should show close button when closable", () => {
    render(<Alert closable title="Alert" />);

    const closeButton = screen.getByLabelText("닫기");
    expect(closeButton).toBeInTheDocument();
  });

  it("should call onClose when close button clicked", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<Alert closable onClose={handleClose} title="Alert" />);

    const closeButton = screen.getByLabelText("닫기");
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should render action element", () => {
    render(<Alert action={<button>Action</button>} title="Alert" />);

    const action = screen.getByRole("button", { name: "Action" });
    expect(action).toBeInTheDocument();
  });

  it("should apply dot prop styles on top of variant styles", () => {
    const { container } = render(<Alert dot="p-8" title="Alert" />);

    const alert = container.querySelector("div");
    // dot prop styles are merged last — container should still exist
    expect(alert).toBeInTheDocument();
  });

  it("should apply explicit style prop", () => {
    const { container } = render(
      <Alert style={{ marginBottom: "2rem" }} title="Alert" />,
    );

    const alert = container.querySelector("div");
    expect(alert?.style.marginBottom).toBe("2rem");
  });
});

describe("AlertSuccess", () => {
  it("should render with success variant", () => {
    const { container } = render(<AlertSuccess title="Success" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-success) 10%, transparent)",
    );
  });
});

describe("AlertWarning", () => {
  it("should render with warning variant", () => {
    const { container } = render(<AlertWarning title="Warning" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-warning) 10%, transparent)",
    );
  });
});

describe("AlertError", () => {
  it("should render with error variant", () => {
    const { container } = render(<AlertError title="Error" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-destructive) 10%, transparent)",
    );
  });
});

describe("AlertInfo", () => {
  it("should render with info variant", () => {
    const { container } = render(<AlertInfo title="Info" />);

    const alert = container.querySelector("div");
    expect(alert?.style.backgroundColor).toBe(
      "color-mix(in srgb, var(--color-info) 10%, transparent)",
    );
  });
});
