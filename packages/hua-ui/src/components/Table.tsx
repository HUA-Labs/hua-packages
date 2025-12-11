"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Table 컴포넌트의 props / Table component props
 * @typedef {Object} TableProps
 * @property {React.ReactNode} children - TableHeader, TableBody, TableFooter 등 / TableHeader, TableBody, TableFooter, etc.
 * @property {"default" | "bordered" | "striped"} [variant="default"] - Table 스타일 변형 / Table style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Table 크기 / Table size
 * @extends {React.HTMLAttributes<HTMLTableElement>}
 */
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  variant?: "default" | "bordered" | "striped"
  size?: "sm" | "md" | "lg"
}

/**
 * TableHeader 컴포넌트의 props / TableHeader component props
 * @typedef {Object} TableHeaderProps
 * @property {React.ReactNode} children - TableHead 컴포넌트들 / TableHead components
 * @extends {React.HTMLAttributes<HTMLTableSectionElement>}
 */
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

/**
 * TableBody 컴포넌트의 props / TableBody component props
 * @typedef {Object} TableBodyProps
 * @property {React.ReactNode} children - TableRow 컴포넌트들 / TableRow components
 * @extends {React.HTMLAttributes<HTMLTableSectionElement>}
 */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

/**
 * TableFooter 컴포넌트의 props / TableFooter component props
 * @typedef {Object} TableFooterProps
 * @property {React.ReactNode} children - TableRow 컴포넌트들 / TableRow components
 * @extends {React.HTMLAttributes<HTMLTableSectionElement>}
 */
export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

/**
 * TableRow 컴포넌트의 props / TableRow component props
 * @typedef {Object} TableRowProps
 * @property {React.ReactNode} children - TableHead 또는 TableCell 컴포넌트들 / TableHead or TableCell components
 * @property {"default" | "hover"} [variant="default"] - Row 스타일 변형 / Row style variant
 * @extends {React.HTMLAttributes<HTMLTableRowElement>}
 */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  variant?: "default" | "hover"
}

/**
 * TableHead 컴포넌트의 props / TableHead component props
 * @typedef {Object} TableHeadProps
 * @property {React.ReactNode} children - 헤더 셀 내용 / Header cell content
 * @extends {React.ThHTMLAttributes<HTMLTableCellElement>}
 */
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

/**
 * TableCell 컴포넌트의 props / TableCell component props
 * @typedef {Object} TableCellProps
 * @property {React.ReactNode} children - 셀 내용 / Cell content
 * @extends {React.TdHTMLAttributes<HTMLTableCellElement>}
 */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

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
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "bordered":
          return "border border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700"
        case "striped":
          return "divide-y divide-slate-200 dark:divide-slate-700"
        default:
          return ""
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-sm"
        case "lg":
          return "text-base"
        default:
          return "text-sm"
      }
    }

    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={merge(
            "w-full caption-bottom",
            getVariantClasses(),
            getSizeClasses(),
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Table.displayName = "Table"

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
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={merge("[&_tr]:border-b", className)} {...props} />
  )
)
TableHeader.displayName = "TableHeader"

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
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={merge("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
)
TableBody.displayName = "TableBody"

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
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={merge(
        "border-t bg-slate-50 dark:bg-slate-800/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
)
TableFooter.displayName = "TableFooter"

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
  ({ className, variant = "default", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "hover":
          return "hover:bg-slate-50 dark:hover:bg-slate-800/50"
        default:
          return ""
      }
    }

    return (
      <tr
        ref={ref}
        className={merge(
          "border-b transition-colors data-[state=selected]:bg-slate-50 dark:data-[state=selected]:bg-slate-800/50",
          getVariantClasses(),
          className
        )}
        {...props}
      />
    )
  }
)
TableRow.displayName = "TableRow"

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
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={merge(
        "h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

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
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={merge("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

/**
 * TableCaption 컴포넌트 / TableCaption component
 * 테이블의 캡션을 표시합니다.
 * Displays a table caption.
 * 
 * @component
 * @param {React.HTMLAttributes<HTMLTableCaptionElement>} props - TableCaption 컴포넌트의 props / TableCaption component props
 * @param {React.Ref<HTMLTableCaptionElement>} ref - caption 요소 ref / caption element ref
 * @returns {JSX.Element} TableCaption 컴포넌트 / TableCaption component
 */
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={merge("mt-4 text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  )
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} 