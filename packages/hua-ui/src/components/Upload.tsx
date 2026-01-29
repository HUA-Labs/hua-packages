"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import type { IconName } from "../lib/icons"

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
  id: string
  file: File
  name: string
  size: number
  type: string
  progress?: number
  status?: "pending" | "uploading" | "success" | "error"
  url?: string
  error?: string
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
 * @property {string} [className] - 추가 클래스명 / Additional class name
 */
export interface UploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  files?: UploadedFile[]
  onChange?: (files: File[]) => void
  onRemove?: (file: UploadedFile) => void
  multiple?: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  dragDrop?: boolean
  placeholder?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

const getFileIcon = (type: string): IconName => {
  if (type.startsWith("image/")) return "image"
  if (type.startsWith("video/")) return "video"
  if (type.includes("pdf")) return "fileText"
  if (type.includes("word") || type.includes("document")) return "fileText"
  if (type.includes("excel") || type.includes("spreadsheet")) return "fileText"
  return "file"
}

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
      className,
      ...props
    },
    ref
  ) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    const handleFileSelect = (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return

      const fileArray = Array.from(selectedFiles)
      
      // 파일 개수 체크
      if (maxFiles && files.length + fileArray.length > maxFiles) {
        alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
        return
      }

      // 파일 크기 체크
      const validFiles = fileArray.filter((file) => {
        if (maxSize && file.size > maxSize) {
          alert(`파일 크기는 ${formatFileSize(maxSize)}를 초과할 수 없습니다: ${file.name}`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        onChange?.(validFiles)
      }
    }

    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click()
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && dragDrop) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!disabled && dragDrop) {
        handleFileSelect(e.dataTransfer.files)
      }
    }

    const handleRemove = (file: UploadedFile) => {
      onRemove?.(file)
    }

    const sizeClasses = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }

    return (
      <div ref={ref} className={merge("w-full", className)} {...props}>
        {/* 업로드 영역 */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={merge(
            "relative border-2 border-dashed rounded-xl transition-all cursor-pointer",
            "bg-gray-50 dark:bg-gray-900/50",
            "border-gray-300 dark:border-gray-700",
            isDragging && "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
            disabled && "cursor-not-allowed opacity-50",
            sizeClasses[size]
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            aria-label="파일 선택"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className={merge(
              "rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-4 mb-4",
              isDragging && "bg-indigo-200 dark:bg-indigo-900/50"
            )}>
              <Icon 
                name="upload" 
                className={merge(
                  "h-8 w-8 text-indigo-600 dark:text-indigo-400",
                  isDragging && "scale-110"
                )} 
              />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {placeholder}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept && `지원 형식: ${accept}`}
              {maxSize && ` • 최대 크기: ${formatFileSize(maxSize)}`}
              {maxFiles && ` • 최대 ${maxFiles}개`}
            </p>
          </div>
        </div>

        {/* 파일 목록 */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={merge(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  "bg-white dark:bg-gray-800",
                  "border-gray-200 dark:border-gray-700",
                  file.status === "error" && "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                )}
              >
                <div className="flex-shrink-0">
                  <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-2">
                    <Icon 
                      name={getFileIcon(file.type)} 
                      className="h-5 w-5 text-gray-600 dark:text-gray-400" 
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === "uploading" && file.progress !== undefined && (
                      <>
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {file.progress}%
                        </span>
                      </>
                    )}
                    {file.status === "success" && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Icon name="check" className="h-3 w-3" />
                        완료
                      </span>
                    )}
                    {file.status === "error" && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {file.error || "업로드 실패"}
                      </span>
                    )}
                  </div>
                </div>

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(file)}
                    className="flex-shrink-0 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="파일 제거"
                  >
                    <Icon name="close" className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

Upload.displayName = "Upload"


