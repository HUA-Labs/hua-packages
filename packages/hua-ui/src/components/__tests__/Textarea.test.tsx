import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "../Textarea";

describe("Textarea", () => {
  it("should render textarea element", () => {
    render(<Textarea aria-label="Description" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  it("should render with placeholder", () => {
    render(<Textarea placeholder="Enter your text here" />);

    const textarea = screen.getByPlaceholderText("Enter your text here");
    expect(textarea).toBeInTheDocument();
  });

  it("should allow user to type", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Comment" />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello World");

    expect(textarea).toHaveValue("Hello World");
  });

  it("should respect rows prop", () => {
    render(<Textarea rows={10} aria-label="Large text" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "10");
  });

  it("should be disabled when disabled prop is set", () => {
    render(<Textarea disabled aria-label="Disabled textarea" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("should have error state with aria-invalid", () => {
    render(<Textarea error aria-label="Error textarea" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it.each([true, "true", "grammar", "spelling"] as const)(
    "preserves the invalid token %s and applies invalid styling",
    (ariaInvalid) => {
      render(
        <Textarea
          aria-invalid={ariaInvalid}
          aria-label={`Invalid ${String(ariaInvalid)}`}
        />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", String(ariaInvalid));
      expect(textarea.style.borderColor).toContain("destructive");
    },
  );

  it.each([false, "false"] as const)(
    "preserves the non-invalid token %s without invalid styling",
    (ariaInvalid) => {
      render(
        <Textarea
          aria-invalid={ariaInvalid}
          aria-label={`Valid ${String(ariaInvalid)}`}
        />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", String(ariaInvalid));
      expect(textarea.style.borderColor).not.toContain("destructive");
    },
  );

  it("lets the error contract override an explicit aria-invalid=false", () => {
    render(<Textarea error aria-invalid="false" aria-label="Forced invalid" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea.style.borderColor).toContain("destructive");
  });

  it("composes consumer focus handlers with internal invalid focus styling", async () => {
    const onFocus = vi.fn();
    const user = userEvent.setup();
    render(<Textarea error onFocus={onFocus} aria-label="Composed focus" />);

    const textarea = screen.getByRole("textbox");
    await user.click(textarea);

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(textarea.style.boxShadow).toContain("destructive");
  });

  it("should apply resize variants via inline style", () => {
    const { container } = render(
      <Textarea resize="none" aria-label="No resize" />,
    );

    const textarea = container.querySelector("textarea");
    // RESIZE_STYLE.none = { resize: 'none' } — inline style
    expect(textarea).toHaveStyle({ resize: "none" });
  });

  it("should apply size variants via inline style", () => {
    const { container } = render(
      <Textarea size="sm" aria-label="Small textarea" />,
    );

    const textarea = container.querySelector("textarea");
    // sm: px-3 py-2 text-sm → fontSize: 14px, minHeight: 80px
    expect(textarea).toHaveStyle({ fontSize: "14px" });
    expect(textarea).toHaveStyle({ minHeight: "80px" });
  });
});
