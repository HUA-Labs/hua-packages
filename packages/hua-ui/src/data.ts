/**
 * Data Display Components Entrypoint
 *
 * 데이터 표시 관련 합성 컴포넌트의 엔트리 포인트입니다.
 * 테이블, 코드블록 등 다중 파트 컴포넌트를 포함합니다.
 *
 * Entry point for data display composite components.
 * Includes multi-part components like Table, CodeBlock.
 *
 * @example
 * import { Table, TableHeader, TableBody, TableRow, TableCell } from '@hua-labs/ui/data';
 * import { CodeBlock, InlineCode } from '@hua-labs/ui/data';
 *
 * Note: Badge, Progress, Skeleton remain in core (@hua-labs/ui)
 * as they are atomic, single-purpose components.
 */

// Table
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/Table';

// Code Display
export { CodeBlock, InlineCode } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';
