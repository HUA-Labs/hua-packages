import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormControl, useFormValidation } from "../FormControl";
import React from "react";

describe("FormControl", () => {
  it("should render children", () => {
    render(
      <FormControl>
        <input data-testid="input" />
      </FormControl>,
    );
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("should render label", () => {
    render(
      <FormControl label="Email">
        <input />
      </FormControl>,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should show required asterisk", () => {
    render(
      <FormControl label="Name" required>
        <input />
      </FormControl>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should render description when no error", () => {
    render(
      <FormControl description="Enter your email address">
        <input />
      </FormControl>,
    );
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("should hide description when error exists", () => {
    render(
      <FormControl description="Help text" error="Something went wrong">
        <input />
      </FormControl>,
    );
    expect(screen.queryByText("Help text")).not.toBeInTheDocument();
  });

  it("should render error message with alert role", () => {
    render(
      <FormControl error="Invalid email">
        <input />
      </FormControl>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });

  it("should set aria-invalid on child when error", () => {
    render(
      <FormControl error="Bad value" htmlFor="test">
        <input data-testid="input" />
      </FormControl>,
    );
    expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
  });

  it("should set aria-describedby pointing to error", () => {
    render(
      <FormControl error="Err" htmlFor="myfield">
        <input data-testid="input" />
      </FormControl>,
    );
    expect(screen.getByTestId("input")).toHaveAttribute(
      "aria-describedby",
      "myfield-error",
    );
  });

  it("should render without errors", () => {
    const { container } = render(
      <FormControl>
        <input />
      </FormControl>,
    );
    // FormControl renders a div wrapper — it should be present
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("keeps opaque root classes while unstyled removes only root layout defaults", () => {
    const onInvalid = vi.fn((event: React.FormEvent<HTMLInputElement>) => {
      expect(event.defaultPrevented).toBe(true);
    });
    const rawClassName = "legacy-form  css-module_hash";
    const { container } = render(
      <>
        <style>{`.legacy-form { display: grid; row-gap: 1px; }`}</style>
        <FormControl
          className={rawClassName}
          unstyled
          dot="opacity-50"
          style={{ paddingTop: "3px" }}
          label="Email"
          error="Invalid email"
          htmlFor="email"
        >
          <input data-testid="compat-input" onInvalid={onInvalid} />
        </FormControl>
      </>,
    );

    const root = container.querySelector(".legacy-form") as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("class")).toBe(rawClassName);
    expect(getComputedStyle(root).display).toBe("grid");
    expect(getComputedStyle(root).rowGap).toBe("1px");
    expect(root.style.opacity).toBe("0.5");
    expect(root.style.paddingTop).toBe("3px");

    const input = screen.getByTestId("compat-input");
    expect(input.parentElement?.style.position).toBe("relative");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
    fireEvent.invalid(input);
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
    expect(root).not.toHaveAttribute("unstyled");
  });
});

describe("useFormValidation", () => {
  function TestComponent() {
    const { errors, validate, clearError, clearAllErrors } =
      useFormValidation();

    return (
      <div>
        <button
          onClick={() =>
            validate({
              email: { value: "", required: true },
              name: { value: "ab", minLength: 3 },
            })
          }
        >
          Validate
        </button>
        <button onClick={() => clearError("email")}>Clear email</button>
        <button onClick={() => clearAllErrors()}>Clear all</button>
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
        {errors.name && <span data-testid="name-error">{errors.name}</span>}
      </div>
    );
  }

  it("should validate required fields", () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Validate"));
    expect(screen.getByTestId("email-error")).toHaveTextContent(
      "This field is required",
    );
  });

  it("should validate minLength", () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Validate"));
    expect(screen.getByTestId("name-error")).toHaveTextContent(
      "Must be at least 3 characters",
    );
  });

  it("should clear specific error", () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Validate"));
    expect(screen.getByTestId("email-error")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Clear email"));
    expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
  });

  it("should clear all errors", () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText("Validate"));
    fireEvent.click(screen.getByText("Clear all"));
    expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("name-error")).not.toBeInTheDocument();
  });
});
