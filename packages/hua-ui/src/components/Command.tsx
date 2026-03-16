"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

/**
 * Command 컴포넌트의 props / Command component props
 * @typedef {Object} CommandProps
 * @property {React.ReactNode} children - CommandList, CommandItem 등 / CommandList, CommandItem, etc.
 * @property {boolean} [open] - 제어 모드에서 열림/닫힘 상태 / Open/close state in controlled mode
 * @property {(open: boolean) => void} [onOpenChange] - 상태 변경 콜백 / State change callback
 * @property {string} [placeholder="명령어를 검색하세요..."] - 검색 입력 플레이스홀더 / Search input placeholder
 * @property {string} [searchValue] - 제어 모드에서 검색 값 / Search value in controlled mode
 * @property {(value: string) => void} [onSearchChange] - 검색 값 변경 콜백 / Search value change callback
 * @property {boolean} [disabled=false] - Command 비활성화 여부 / Disable command
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface CommandProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  disabled?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * Command 컴포넌트 / Command component
 *
 * 명령 팔레트(Command Palette) 컴포넌트입니다.
 * Cmd+K (Mac) 또는 Ctrl+K (Windows)로 열 수 있습니다.
 * 키보드 네비게이션(Arrow keys, Enter, Escape)을 지원합니다.
 *
 * Command Palette component.
 * Can be opened with Cmd+K (Mac) or Ctrl+K (Windows).
 * Supports keyboard navigation (Arrow keys, Enter, Escape).
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Command>
 *   <CommandInput placeholder="검색..." />
 *   <CommandList>
 *     <CommandItem>항목 1</CommandItem>
 *     <CommandItem>항목 2</CommandItem>
 *   </CommandList>
 * </Command>
 *
 * @example
 * // 제어 모드 / Controlled mode
 * const [open, setOpen] = useState(false)
 * <Command
 *   open={open}
 *   onOpenChange={setOpen}
 * >
 *   <CommandList>
 *     <CommandGroup heading="파일">
 *       <CommandItem>새 파일</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 *
 * @param {CommandProps} props - Command 컴포넌트의 props / Command component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Command 컴포넌트 / Command component
 */
const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  (
    {
      children,
      open: controlledOpen,
      onOpenChange,
      placeholder = "명령어를 검색하세요...",
      searchValue: controlledSearchValue,
      onSearchChange,
      disabled = false,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [internalSearchValue, setInternalSearchValue] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const commandRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const searchValue =
      controlledSearchValue !== undefined
        ? controlledSearchValue
        : internalSearchValue;

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (disabled) return;

        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [disabled, isControlled, onOpenChange],
    );

    const handleSearchChange = (value: string) => {
      if (!isControlled) {
        setInternalSearchValue(value);
      }
      onSearchChange?.(value);
      setSelectedIndex(0);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      const items = listRef.current?.querySelectorAll("[data-command-item]");
      const itemCount = items?.length || 0;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % itemCount);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case "Enter": {
          event.preventDefault();
          const selectedItem = items?.[selectedIndex] as HTMLElement;
          selectedItem?.click();
          break;
        }
        case "Escape":
          event.preventDefault();
          handleOpenChange(false);
          break;
      }
    };

    React.useEffect(() => {
      if (isOpen) {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }
    }, [isOpen]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          handleOpenChange(!isOpen);
        }
        // 전역 ESC 키 처리
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          handleOpenChange(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen, handleOpenChange]);

    React.useEffect(() => {
      const selectedItem = listRef.current?.querySelector(
        `[data-command-item]:nth-child(${selectedIndex + 1})`,
      ) as HTMLElement;
      selectedItem?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    return (
      <div
        ref={ref}
        style={mergeStyles(resolveDot("relative"), resolveDot(dotProp), style)}
        {...props}
      >
        {isOpen && (
          <div
            ref={commandRef}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              ...resolveDot("pt-16"),
            }}
            onClick={() => handleOpenChange(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "42rem",
                margin: "0 1rem",
                backgroundColor: "var(--color-popover)",
                color: "var(--color-popover-foreground)",
                borderRadius: "0.5rem",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "none",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  ...resolveDot("p-4"),
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    fontSize: "1.125rem",
                    fontWeight: 500,
                    outline: "none",
                    border: "none",
                    color: "var(--color-foreground)",
                  }}
                />
              </div>

              <div
                ref={listRef}
                style={{
                  maxHeight: "24rem",
                  overflowY: "auto",
                  ...resolveDot("py-2"),
                }}
              >
                {React.Children.map(children, (child, index) => {
                  if (React.isValidElement<CommandItemProps>(child)) {
                    // Fragment나 다른 컴포넌트에 selected prop 전달 방지
                    if (
                      child.type === React.Fragment ||
                      typeof child.type === "symbol"
                    ) {
                      return child;
                    }
                    return React.cloneElement(child, {
                      selected: index === selectedIndex,
                      onSelect: () => {
                        child.props.onSelect?.();
                        handleOpenChange(false);
                      },
                    });
                  }
                  return child;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
Command.displayName = "Command";

/**
 * CommandInput 컴포넌트의 props / CommandInput component props
 * @typedef {Object} CommandInputProps
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>}
 */
export interface CommandInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ dot: dotProp, style, ...props }, ref) => (
    <input
      ref={ref}
      style={mergeStyles(
        {
          display: "flex",
          height: "2.5rem",
          width: "100%",
          borderRadius: "0.375rem",
          backgroundColor: "transparent",
          ...resolveDot("py-2 px-3"),
          fontSize: "0.875rem",
          outline: "none",
          border: "none",
          color: "var(--color-foreground)",
        },
        resolveDot(dotProp),
        style,
      )}
      {...props}
    />
  ),
);
CommandInput.displayName = "CommandInput";

export interface CommandListProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ dot: dotProp, style, ...props }, ref) => (
    <div
      ref={ref}
      style={mergeStyles(
        { maxHeight: "24rem", overflowY: "auto", ...resolveDot("py-2") },
        resolveDot(dotProp),
        style,
      )}
      {...props}
    />
  ),
);
CommandList.displayName = "CommandList";

/**
 * CommandItem 컴포넌트의 props / CommandItem component props
 * @typedef {Object} CommandItemProps
 * @property {React.ReactNode} [icon] - 항목 아이콘 / Item icon
 * @property {boolean} [selected=false] - 선택 상태 / Selected state
 * @property {() => void} [onSelect] - 선택 시 콜백 / Selection callback
 * @extends {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>}
 */
export interface CommandItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  icon?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  dot?: string;
  style?: React.CSSProperties;
}

const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(
  (
    {
      icon,
      selected = false,
      onSelect,
      children,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        data-command-item
        style={mergeStyles(
          {
            position: "relative",
            display: "flex",
            width: "100%",
            alignItems: "center",
            ...resolveDot("gap-3"),
            borderRadius: "0.125rem",
            ...resolveDot("py-3 px-4"),
            fontSize: "0.875rem",
            color: "var(--color-foreground)",
            backgroundColor: selected ? "var(--color-muted)" : "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background-color 150ms",
            textAlign: "left",
          },
          resolveDot(dotProp),
          style,
        )}
        onClick={onSelect}
        {...props}
      >
        {icon && (
          <div
            style={{
              flexShrink: 0,
              width: "1rem",
              height: "1rem",
              color: "var(--color-muted-foreground)",
            }}
          >
            {icon}
          </div>
        )}
        <span style={{ flex: 1, textAlign: "left" }}>{children}</span>
      </button>
    );
  },
);
CommandItem.displayName = "CommandItem";

/**
 * CommandGroup 컴포넌트의 props / CommandGroup component props
 * @typedef {Object} CommandGroupProps
 * @property {React.ReactNode} [heading] - 그룹 제목 / Group heading
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface CommandGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  heading?: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, children, dot: dotProp, style, ...props }, ref) => (
    <div
      ref={ref}
      style={mergeStyles(resolveDot("py-2"), resolveDot(dotProp), style)}
      {...props}
    >
      {heading && (
        <div
          style={{
            ...resolveDot("py-2 px-4"),
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {heading}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          ...resolveDot("gap-1"),
        }}
      >
        {children}
      </div>
    </div>
  ),
);
CommandGroup.displayName = "CommandGroup";

/**
 * CommandSeparator 컴포넌트의 props / CommandSeparator component props
 * @typedef {Object} CommandSeparatorProps
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface CommandSeparatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(({ dot: dotProp, style, ...props }, ref) => (
  <div
    ref={ref}
    style={mergeStyles(
      {
        height: "1px",
        backgroundColor: "var(--color-border)",
        ...resolveDot("my-2"),
      },
      resolveDot(dotProp),
      style,
    )}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

/**
 * CommandEmpty 컴포넌트의 props / CommandEmpty component props
 * @typedef {Object} CommandEmptyProps
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface CommandEmptyProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children = "결과가 없습니다.", dot: dotProp, style, ...props }, ref) => (
    <div
      ref={ref}
      style={mergeStyles(
        {
          ...resolveDot("py-8"),
          textAlign: "center",
          fontSize: "0.875rem",
          color: "var(--color-muted-foreground)",
        },
        resolveDot(dotProp),
        style,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
CommandEmpty.displayName = "CommandEmpty";

// 편의 컴포넌트들
export const CommandDialog = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ dot: dotProp, style, ...props }, ref) => (
    <Command ref={ref} dot={dotProp} style={style} {...props} />
  ),
);
CommandDialog.displayName = "CommandDialog";

export {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
};
