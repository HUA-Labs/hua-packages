"use client";

import React, { useMemo, useState } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ── Base styles ────────────────────────────────────────────────────────────

const TABLE_BASE: React.CSSProperties = {
  width: "100%",
  captionSide: "bottom",
  fontSize: "0.875rem",
  borderCollapse: "collapse",
};

const THEAD_BASE: React.CSSProperties = {
  borderBottom: "1px solid var(--color-border)",
};

const TBODY_BASE: React.CSSProperties = {};

const TFOOT_BASE: React.CSSProperties = {
  borderTop: "1px solid var(--color-border)",
  fontWeight: 500,
};

const TR_BASE: React.CSSProperties = {
  borderBottom: "1px solid var(--color-border)",
  transition: "background-color 150ms",
};

const TH_BASE: React.CSSProperties = {
  ...resolveDot("h-12 px-4"),
  textAlign: "left",
  verticalAlign: "middle",
  fontWeight: 500,
  color: "var(--color-muted-foreground)",
};

const TD_BASE: React.CSSProperties = {
  ...resolveDot("p-4"),
  verticalAlign: "middle",
};

const CAPTION_BASE: React.CSSProperties = {
  ...resolveDot("mt-4"),
  fontSize: "0.875rem",
  color: "var(--color-muted-foreground)",
};

// ── Variant styles ─────────────────────────────────────────────────────────

const TABLE_VARIANT: Record<
  "default" | "bordered" | "striped",
  React.CSSProperties
> = {
  default: {},
  bordered: {
    border: "1px solid var(--color-border)",
  },
  striped: {},
};

// ── Size styles (applied to th/td padding via context) ─────────────────────

const SIZE_PADDING: Record<
  "sm" | "md" | "lg",
  {
    th: React.CSSProperties;
    td: React.CSSProperties;
    fontSize: React.CSSProperties;
  }
> = {
  sm: {
    th: { ...resolveDot("px-3 h-10") },
    td: { ...resolveDot("py-2 px-3") },
    fontSize: { fontSize: "0.8125rem" },
  },
  md: {
    th: {},
    td: {},
    fontSize: {},
  },
  lg: {
    th: { padding: "0 1.25rem", height: "3.5rem" },
    td: { padding: "1.25rem" },
    fontSize: { fontSize: "1rem" },
  },
};

// ── Context ────────────────────────────────────────────────────────────────

interface TableContextValue {
  variant: "default" | "bordered" | "striped";
  size: "sm" | "md" | "lg";
}

const TableContext = React.createContext<TableContextValue>({
  variant: "default",
  size: "md",
});

// ── Interfaces ─────────────────────────────────────────────────────────────

/**
 * Table 컴포넌트의 props / Table component props
 * @typedef {Object} TableProps
 * @property {React.ReactNode} children - TableHeader, TableBody, TableFooter 등 / TableHeader, TableBody, TableFooter, etc.
 * @property {"default" | "bordered" | "striped"} [variant="default"] - Table 스타일 변형 / Table style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Table 크기 / Table size
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableProps extends Omit<
  React.HTMLAttributes<HTMLTableElement>,
  "className"
> {
  children: React.ReactNode;
  variant?: "default" | "bordered" | "striped";
  size?: "sm" | "md" | "lg";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TableHeader 컴포넌트의 props / TableHeader component props
 * @typedef {Object} TableHeaderProps
 * @property {React.ReactNode} children - TableHead 컴포넌트들 / TableHead components
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableHeaderProps extends Omit<
  React.HTMLAttributes<HTMLTableSectionElement>,
  "className"
> {
  children: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TableBody 컴포넌트의 props / TableBody component props
 * @typedef {Object} TableBodyProps
 * @property {React.ReactNode} children - TableRow 컴포넌트들 / TableRow components
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableBodyProps extends Omit<
  React.HTMLAttributes<HTMLTableSectionElement>,
  "className"
> {
  children: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TableFooter 컴포넌트의 props / TableFooter component props
 * @typedef {Object} TableFooterProps
 * @property {React.ReactNode} children - TableRow 컴포넌트들 / TableRow components
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableFooterProps extends Omit<
  React.HTMLAttributes<HTMLTableSectionElement>,
  "className"
> {
  children: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TableRow 컴포넌트의 props / TableRow component props
 * @typedef {Object} TableRowProps
 * @property {React.ReactNode} children - TableHead 또는 TableCell 컴포넌트들 / TableHead or TableCell components
 * @property {"default" | "hover"} [variant="default"] - Row 스타일 변형 / Row style variant
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableRowProps extends Omit<
  React.HTMLAttributes<HTMLTableRowElement>,
  "className"
> {
  children: React.ReactNode;
  variant?: "default" | "hover";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TableHead 컴포넌트의 props / TableHead component props
 * @typedef {Object} TableHeadProps
 * @property {React.ReactNode} children - 헤더 셀 내용 / Header cell content
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableHeadProps extends Omit<
  React.ThHTMLAttributes<HTMLTableCellElement>,
  "className"
> {
  children?: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * TableCell 컴포넌트의 props / TableCell component props
 * @typedef {Object} TableCellProps
 * @property {React.ReactNode} children - 셀 내용 / Cell content
 * @property {string} [dot] - dot utility string for custom styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface TableCellProps extends Omit<
  React.TdHTMLAttributes<HTMLTableCellElement>,
  "className"
> {
  children?: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

// ── Components ─────────────────────────────────────────────────────────────

/**
 * Table 컴포넌트 / Table component
 *
 * 데이터를 표 형태로 표시하는 테이블 컴포넌트입니다.
 * TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell과 함께 사용합니다.
 *
 * Table component that displays data in tabular format.
 * Used with TableHeader, TableBody, TableFooter, TableRow, TableHead, and TableCell.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>이름</TableHead>
 *       <TableHead>나이</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>홍길동</TableCell>
 *       <TableCell>30</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 *
 * @example
 * // Bordered 스타일 / Bordered style
 * <Table variant="bordered">
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>항목</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>값</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 *
 * @example
 * // Striped 스타일, 호버 효과 / Striped style with hover effect
 * <Table variant="striped">
 *   <TableBody>
 *     <TableRow variant="hover">
 *       <TableCell>데이터</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 *
 * @param {TableProps} props - Table 컴포넌트의 props / Table component props
 * @param {React.Ref<HTMLTableElement>} ref - table 요소 ref / table element ref
 * @returns {JSX.Element} Table 컴포넌트 / Table component
 */
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    { dot: dotProp, variant = "default", size = "md", style, ...props },
    ref,
  ) => {
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          TABLE_BASE,
          TABLE_VARIANT[variant],
          SIZE_PADDING[size].fontSize,
          resolveDot(dotProp),
          style,
        ),
      [variant, size, dotProp, style],
    );

    return (
      <TableContext.Provider value={{ variant, size }}>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table ref={ref} style={computedStyle} {...props} />
        </div>
      </TableContext.Provider>
    );
  },
);
Table.displayName = "Table";

/**
 * TableHeader 컴포넌트 / TableHeader component
 * 테이블의 헤더 영역을 표시합니다.
 * Displays the header area of a table.
 *
 * @component
 * @param {TableHeaderProps} props - TableHeader 컴포넌트의 props / TableHeader component props
 * @param {React.Ref<HTMLTableSectionElement>} ref - thead 요소 ref / thead element ref
 * @returns {JSX.Element} TableHeader 컴포넌트 / TableHeader component
 */
const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(THEAD_BASE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    return <thead ref={ref} style={computedStyle} {...props} />;
  },
);
TableHeader.displayName = "TableHeader";

/**
 * TableBody 컴포넌트 / TableBody component
 * 테이블의 본문 영역을 표시합니다.
 * Displays the body area of a table.
 *
 * @component
 * @param {TableBodyProps} props - TableBody 컴포넌트의 props / TableBody component props
 * @param {React.Ref<HTMLTableSectionElement>} ref - tbody 요소 ref / tbody element ref
 * @returns {JSX.Element} TableBody 컴포넌트 / TableBody component
 */
const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(TBODY_BASE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    return <tbody ref={ref} style={computedStyle} {...props} />;
  },
);
TableBody.displayName = "TableBody";

/**
 * TableFooter 컴포넌트 / TableFooter component
 * 테이블의 푸터 영역을 표시합니다.
 * Displays the footer area of a table.
 *
 * @component
 * @param {TableFooterProps} props - TableFooter 컴포넌트의 props / TableFooter component props
 * @param {React.Ref<HTMLTableSectionElement>} ref - tfoot 요소 ref / tfoot element ref
 * @returns {JSX.Element} TableFooter 컴포넌트 / TableFooter component
 */
const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(TFOOT_BASE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    return <tfoot ref={ref} style={computedStyle} {...props} />;
  },
);
TableFooter.displayName = "TableFooter";

/**
 * TableRow 컴포넌트 / TableRow component
 * 테이블의 행을 표시합니다.
 * Displays a table row.
 *
 * @component
 * @param {TableRowProps} props - TableRow 컴포넌트의 props / TableRow component props
 * @param {React.Ref<HTMLTableRowElement>} ref - tr 요소 ref / tr element ref
 * @returns {JSX.Element} TableRow 컴포넌트 / TableRow component
 */
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      dot: dotProp,
      variant = "default",
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const computedStyle = useMemo(
      () =>
        mergeStyles(
          TR_BASE,
          isHovered && variant === "hover"
            ? { backgroundColor: "var(--color-muted)" }
            : undefined,
          resolveDot(dotProp),
          style,
        ),
      [variant, isHovered, dotProp, style],
    );

    const handleMouseEnter = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (variant === "hover") setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (variant === "hover") setIsHovered(false);
      onMouseLeave?.(e);
    };

    return (
      <tr
        ref={ref}
        style={computedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    );
  },
);
TableRow.displayName = "TableRow";

/**
 * TableHead 컴포넌트 / TableHead component
 * 테이블의 헤더 셀을 표시합니다.
 * Displays a table header cell.
 *
 * @component
 * @param {TableHeadProps} props - TableHead 컴포넌트의 props / TableHead component props
 * @param {React.Ref<HTMLTableCellElement>} ref - th 요소 ref / th element ref
 * @returns {JSX.Element} TableHead 컴포넌트 / TableHead component
 */
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const { size } = React.useContext(TableContext);

    const computedStyle = useMemo(
      () =>
        mergeStyles(TH_BASE, SIZE_PADDING[size].th, resolveDot(dotProp), style),
      [size, dotProp, style],
    );

    return <th ref={ref} style={computedStyle} {...props} />;
  },
);
TableHead.displayName = "TableHead";

/**
 * TableCell 컴포넌트 / TableCell component
 * 테이블의 데이터 셀을 표시합니다.
 * Displays a table data cell.
 *
 * @component
 * @param {TableCellProps} props - TableCell 컴포넌트의 props / TableCell component props
 * @param {React.Ref<HTMLTableCellElement>} ref - td 요소 ref / td element ref
 * @returns {JSX.Element} TableCell 컴포넌트 / TableCell component
 */
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const { size } = React.useContext(TableContext);

    const computedStyle = useMemo(
      () =>
        mergeStyles(TD_BASE, SIZE_PADDING[size].td, resolveDot(dotProp), style),
      [size, dotProp, style],
    );

    return <td ref={ref} style={computedStyle} {...props} />;
  },
);
TableCell.displayName = "TableCell";

/**
 * TableCaption 컴포넌트 / TableCaption component
 * 테이블의 캡션을 표시합니다.
 * Displays a table caption.
 *
 * @component
 * @param {TableCaptionProps} props - TableCaption 컴포넌트의 props / TableCaption component props
 * @param {React.Ref<HTMLTableCaptionElement>} ref - caption 요소 ref / caption element ref
 * @returns {JSX.Element} TableCaption 컴포넌트 / TableCaption component
 */
export interface TableCaptionProps extends Omit<
  React.HTMLAttributes<HTMLTableCaptionElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ dot: dotProp, style, ...props }, ref) => {
  const computedStyle = useMemo(
    () => mergeStyles(CAPTION_BASE, resolveDot(dotProp), style),
    [dotProp, style],
  );

  return <caption ref={ref} style={computedStyle} {...props} />;
});
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
