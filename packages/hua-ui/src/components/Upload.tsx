"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";

/**
 * 업로드된 파일 정보 인터페이스 / Uploaded file information interface
 * @typedef {Object} UploadedFile
 * @property {string} id - 파일 고유 ID / File unique ID
 * @property {File} file - 파일 객체 / File object
 * @property {string} name - 파일 이름 / File name
 * @property {number} size - 파일 크기 (bytes) / File size in bytes
 * @property {string} type - 파일 타입 / File type
 * @property {number} [progress] - 업로드 진행률 (0-100) / Upload progress (0-100)
 * @property {"pending" | "uploading" | "success" | "error"} [status] - 업로드 상태 / Upload status
 * @property {string} [url] - 업로드된 파일 URL / Uploaded file URL
 * @property {string} [error] - 에러 메시지 / Error message
 */
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status?: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

/**
 * Upload 컴포넌트의 props / Upload component props
 * @typedef {Object} UploadProps
 * @property {UploadedFile[]} [files] - 업로드된 파일 목록 / Uploaded files list
 * @property {(files: File[]) => void} [onChange] - 파일 선택 핸들러 / File selection handler
 * @property {(file: UploadedFile) => void} [onRemove] - 파일 제거 핸들러 / File removal handler
 * @property {boolean} [multiple=false] - 다중 파일 선택 허용 / Allow multiple file selection
 * @property {string} [accept] - 허용할 파일 타입 (예: "image/*", ".pdf") / Accepted file types
 * @property {number} [maxSize] - 최대 파일 크기 (bytes) / Maximum file size in bytes
 * @property {number} [maxFiles] - 최대 파일 개수 / Maximum number of files
 * @property {boolean} [disabled=false] - 비활성화 상태 / Disabled state
 * @property {boolean} [dragDrop=true] - 드래그 앤 드롭 활성화 / Enable drag and drop
 * @property {string} [placeholder="파일을 선택하거나 여기에 드래그하세요"] - 플레이스홀더 / Placeholder
 * @property {"sm" | "md" | "lg"} [size="md"] - 크기 / Size
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface UploadProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className" | "onChange"
> {
  files?: UploadedFile[];
  onChange?: (files: File[]) => void;
  onRemove?: (file: UploadedFile) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  dragDrop?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  dot?: string;
  style?: React.CSSProperties;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFileIcon = (type: string): IconName => {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.includes("pdf")) return "fileText";
  if (type.includes("word") || type.includes("document")) return "fileText";
  if (type.includes("excel") || type.includes("spreadsheet")) return "fileText";
  return "file";
};

/** Padding by size */
const SIZE_PADDING: Record<"sm" | "md" | "lg", React.CSSProperties> = {
  sm: resolveDot("p-4"),
  md: resolveDot("p-6"),
  lg: resolveDot("p-8"),
};

/**
 * Upload 컴포넌트 / Upload component
 *
 * 파일을 업로드할 수 있는 컴포넌트입니다.
 * 드래그 앤 드롭, 다중 파일 선택, 파일 크기 제한 등을 지원합니다.
 *
 * Component for uploading files.
 * Supports drag and drop, multiple file selection, file size limits, and more.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Upload
 *   onChange={(files) => console.log(files)}
 * />
 *
 * @example
 * // 이미지만, 다중 선택 / Images only, multiple selection
 * <Upload
 *   accept="image/*"
 *   multiple
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   maxFiles={5}
 *   files={uploadedFiles}
 *   onRemove={(file) => handleRemove(file)}
 * />
 *
 * @param {UploadProps} props - Upload 컴포넌트의 props / Upload component props
 * @returns {JSX.Element} Upload 컴포넌트 / Upload component
 */
export const Upload = React.forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      files = [],
      onChange,
      onRemove,
      multiple = false,
      accept,
      maxSize,
      maxFiles,
      disabled = false,
      dragDrop = true,
      placeholder = "파일을 선택하거나 여기에 드래그하세요",
      size = "md",
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isRemoveHovered, setIsRemoveHovered] = React.useState<string | null>(
      null,
    );

    const handleFileSelect = (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const fileArray = Array.from(selectedFiles);

      // 파일 개수 체크
      if (maxFiles && files.length + fileArray.length > maxFiles) {
        alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return;
      }

      // 파일 크기 체크
      const validFiles = fileArray.filter((file) => {
        if (maxSize && file.size > maxSize) {
          alert(
            `파일 크기는 ${formatFileSize(maxSize)}를 초과할 수 없습니다: ${file.name}`,
          );
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onChange?.(validFiles);
      }
    };

    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && dragDrop) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled && dragDrop) {
        handleFileSelect(e.dataTransfer.files);
      }
    };

    const handleRemove = (file: UploadedFile) => {
      onRemove?.(file);
    };

    // Container style
    const containerStyle = useMemo(
      () => mergeStyles({ width: "100%" }, resolveDot(dotProp), style),
      [dotProp, style],
    );

    // Drop zone style
    const dropZoneStyle = useMemo(
      (): React.CSSProperties => ({
        position: "relative",
        border: `2px dashed ${isDragging ? "var(--upload-dropzone-drag-border)" : "var(--upload-dropzone-border)"}`,
        borderRadius: "12px",
        transition: "all 200ms ease-in-out",
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: isDragging
          ? "var(--upload-dropzone-drag-bg)"
          : "var(--upload-dropzone-bg)",
        opacity: disabled ? 0.5 : 1,
        ...SIZE_PADDING[size],
      }),
      [isDragging, disabled, size],
    );

    // Inner layout style
    const innerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    };

    // Icon wrapper style
    const iconWrapStyle = useMemo(
      (): React.CSSProperties => ({
        borderRadius: "50%",
        backgroundColor: isDragging
          ? "var(--upload-icon-wrap-drag-bg)"
          : "var(--upload-icon-wrap-bg)",
        ...resolveDot("p-4"),
        ...resolveDot("mb-4"),
        transition: "background-color 200ms ease-in-out",
      }),
      [isDragging],
    );

    // Primary text style
    const primaryTextStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "var(--color-foreground)",
      ...resolveDot("mb-1"),
    };

    // Hint text style
    const hintTextStyle: React.CSSProperties = {
      fontSize: "0.75rem",
      color: "var(--color-muted-foreground)",
    };

    // File list container style
    const fileListStyle: React.CSSProperties = {
      ...resolveDot("mt-4"),
      display: "flex",
      flexDirection: "column",
      ...resolveDot("gap-2"),
    };

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {/* 업로드 영역 */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-dragging={isDragging ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-upload-dropzone="true"
          style={dropZoneStyle}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
            aria-label="파일 선택"
          />

          <div style={innerStyle}>
            <div style={iconWrapStyle}>
              <Icon
                name="upload"
                size={32}
                variant="primary"
                dot={isDragging ? "transition-all duration-200" : undefined}
              />
            </div>
            <p style={primaryTextStyle}>{placeholder}</p>
            <p style={hintTextStyle}>
              {accept && `지원 형식: ${accept}`}
              {maxSize && ` • 최대 크기: ${formatFileSize(maxSize)}`}
              {maxFiles && ` • 최대 ${maxFiles}개`}
            </p>
          </div>
        </div>

        {/* 파일 목록 */}
        {files.length > 0 && (
          <div style={fileListStyle}>
            {files.map((file) => {
              const isError = file.status === "error";
              const fileRowStyle: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                ...resolveDot("gap-3"),
                ...resolveDot("p-3"),
                borderRadius: "8px",
                border: `1px solid ${isError ? "var(--upload-file-error-border)" : "var(--upload-file-border)"}`,
                backgroundColor: isError
                  ? "var(--upload-file-error-bg)"
                  : "var(--upload-file-bg)",
              };

              const fileIconWrapStyle: React.CSSProperties = {
                flexShrink: 0,
                borderRadius: "8px",
                backgroundColor: "var(--upload-file-icon-bg)",
                ...resolveDot("p-2"),
              };

              const fileInfoStyle: React.CSSProperties = {
                flex: 1,
                minWidth: 0,
              };

              const fileNameStyle: React.CSSProperties = {
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--color-foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              };

              const fileMeta: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                ...resolveDot("gap-2"),
                ...resolveDot("mt-1"),
              };

              const fileSizeStyle: React.CSSProperties = {
                fontSize: "0.75rem",
                color: "var(--color-muted-foreground)",
              };

              const removeButtonStyle: React.CSSProperties = {
                flexShrink: 0,
                borderRadius: "8px",
                ...resolveDot("p-1.5"),
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  isRemoveHovered === file.id
                    ? "var(--upload-remove-hover-bg)"
                    : "transparent",
                transition: "background-color 150ms ease-in-out",
              };

              return (
                <div key={file.id} style={fileRowStyle}>
                  <div style={fileIconWrapStyle}>
                    <Icon
                      name={getFileIcon(file.type)}
                      size={20}
                      variant="muted"
                    />
                  </div>

                  <div style={fileInfoStyle}>
                    <p style={fileNameStyle}>{file.name}</p>
                    <div style={fileMeta}>
                      <p style={fileSizeStyle}>{formatFileSize(file.size)}</p>
                      {file.status === "uploading" &&
                        file.progress !== undefined && (
                          <>
                            <div
                              style={{
                                flex: 1,
                                height: "6px",
                                backgroundColor: "var(--color-muted)",
                                borderRadius: "9999px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  backgroundColor: "var(--color-primary)",
                                  borderRadius: "9999px",
                                  width: `${file.progress}%`,
                                  transition: "width 300ms ease-out",
                                }}
                              />
                            </div>
                            <span style={fileSizeStyle}>{file.progress}%</span>
                          </>
                        )}
                      {file.status === "success" && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--progress-success)",
                            display: "flex",
                            alignItems: "center",
                            ...resolveDot("gap-1"),
                          }}
                        >
                          <Icon name="check" size={12} variant="success" />
                          완료
                        </span>
                      )}
                      {file.status === "error" && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-destructive)",
                          }}
                        >
                          {file.error || "업로드 실패"}
                        </span>
                      )}
                    </div>
                  </div>

                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => handleRemove(file)}
                      onMouseEnter={() => setIsRemoveHovered(file.id)}
                      onMouseLeave={() => setIsRemoveHovered(null)}
                      style={removeButtonStyle}
                      aria-label="파일 제거"
                    >
                      <Icon name="close" size={16} variant="muted" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

Upload.displayName = "Upload";
