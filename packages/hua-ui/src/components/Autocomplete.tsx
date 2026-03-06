"use client"

import React from "react"
import { Icon } from "./Icon"
import { Input } from "./Input"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

/**
 * Autocomplete 옵션 인터페이스 / Autocomplete option interface
 * @typedef {Object} AutocompleteOption
 * @property {string} value - 옵션 값 / Option value
 * @property {string} label - 옵션 라벨 / Option label
 * @property {string} [description] - 옵션 설명 / Option description
 * @property {React.ReactNode} [icon] - 옵션 아이콘 / Option icon
 * @property {Record<string, unknown>} [data] - 추가 데이터 / Additional data
 */
export interface AutocompleteOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  data?: Record<string, unknown>
}

/**
 * Autocomplete 컴포넌트의 props / Autocomplete component props
 * @typedef {Object} AutocompleteProps
 * @property {AutocompleteOption[]} options - 옵션 목록 / Options list
 * @property {string} [value] - 선택된 값 / Selected value
 * @property {(value: string, option?: AutocompleteOption) => void} [onChange] - 값 변경 핸들러 / Value change handler
 * @property {string} [placeholder="검색하거나 선택하세요"] - 플레이스홀더 / Placeholder
 * @property {boolean} [disabled=false] - 비활성화 상태 / Disabled state
 * @property {boolean} [error=false] - 에러 상태 / Error state
 * @property {boolean} [loading=false] - 로딩 상태 / Loading state
 * @property {number} [maxHeight=300] - 드롭다운 최대 높이 (px) / Dropdown max height in px
 * @property {boolean} [clearable=true] - 지우기 버튼 표시 / Show clear button
 * @property {boolean} [filterable=true] - 필터링 활성화 / Enable filtering
 * @property {(query: string) => AutocompleteOption[] | Promise<AutocompleteOption[]>} [onSearch] - 검색 핸들러 (비동기 지원) / Search handler (async support)
 * @property {React.ReactNode} [emptyText="결과가 없습니다"] - 빈 결과 텍스트 / Empty result text
 * @property {"sm" | "md" | "lg"} [size="md"] - 크기 / Size
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'className'>}
 */
export interface AutocompleteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'className'> {
  options: AutocompleteOption[]
  value?: string
  onChange?: (value: string, option?: AutocompleteOption) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  loading?: boolean
  maxHeight?: number
  clearable?: boolean
  filterable?: boolean
  onSearch?: (query: string) => AutocompleteOption[] | Promise<AutocompleteOption[]>
  emptyText?: string
  size?: "sm" | "md" | "lg"
  /** dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style) */
  dot?: string
  /** 추가 인라인 스타일 / Additional inline style */
  style?: React.CSSProperties
}

const sizeClasses = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
}

/**
 * Autocomplete 컴포넌트 / Autocomplete component
 *
 * 자동완성 입력 컴포넌트입니다.
 * 입력하면서 옵션을 필터링하고 선택할 수 있습니다.
 *
 * Autocomplete input component.
 * Filters and selects options as you type.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Autocomplete
 *   options={[
 *     { value: "1", label: "옵션 1" },
 *     { value: "2", label: "옵션 2" }
 *   ]}
 *   onChange={(value) => console.log(value)}
 * />
 *
 * @example
 * // 비동기 검색 / Async search
 * <Autocomplete
 *   options={options}
 *   onSearch={async (query) => {
 *     const results = await searchAPI(query)
 *     return results
 *   }}
 *   loading={isLoading}
 * />
 *
 * @param {AutocompleteProps} props - Autocomplete 컴포넌트의 props / Autocomplete component props
 * @returns {JSX.Element} Autocomplete 컴포넌트 / Autocomplete component
 */
export const Autocomplete = React.forwardRef<HTMLDivElement, AutocompleteProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "검색하거나 선택하세요",
      disabled = false,
      error = false,
      loading = false,
      maxHeight = 300,
      clearable = true,
      filterable = true,
      onSearch,
      emptyText = "결과가 없습니다",
      size = "md",
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const [filteredOptions, setFilteredOptions] = React.useState<AutocompleteOption[]>(options)
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [isSearching, setIsSearching] = React.useState(false)

    const inputRef = React.useRef<HTMLInputElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = React.useMemo(() => {
      return options.find((opt) => opt.value === value)
    }, [options, value])

    // 초기 입력값 설정
    React.useEffect(() => {
      if (selectedOption) {
        setInputValue(selectedOption.label)
      } else if (!value) {
        setInputValue("")
      }
    }, [selectedOption, value])

    // 옵션 필터링
    React.useEffect(() => {
      if (onSearch) {
        setIsSearching(true)
        const result = onSearch(inputValue)
        if (result instanceof Promise) {
          result.then((filtered) => {
            setFilteredOptions(filtered)
            setIsSearching(false)
          })
        } else {
          setFilteredOptions(result)
          setIsSearching(false)
        }
      } else if (filterable) {
        if (!inputValue.trim()) {
          setFilteredOptions(options)
        } else {
          const filtered = options.filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.description?.toLowerCase().includes(inputValue.toLowerCase())
          )
          setFilteredOptions(filtered)
        }
      } else {
        setFilteredOptions(options)
      }
    }, [inputValue, options, filterable, onSearch])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setIsOpen(true)
      setSelectedIndex(-1)

      if (!newValue && clearable) {
        onChange?.("")
      }
    }

    const handleInputFocus = () => {
      setIsOpen(true)
    }

    const handleInputBlur = (e: React.FocusEvent) => {
      // 드롭다운 클릭 시에는 닫지 않음
      if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
        return
      }
      setIsOpen(false)
      setSelectedIndex(-1)

      // 선택된 옵션이 있으면 그 라벨로 복원
      if (selectedOption) {
        setInputValue(selectedOption.label)
      }
    }

    const handleOptionSelect = (option: AutocompleteOption) => {
      setInputValue(option.label)
      onChange?.(option.value, option)
      setIsOpen(false)
      inputRef.current?.blur()
    }

    const handleClear = () => {
      setInputValue("")
      onChange?.("")
      inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || filteredOptions.length === 0) {
        if (e.key === "ArrowDown") {
          setIsOpen(true)
        }
        return
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
            handleOptionSelect(filteredOptions[selectedIndex])
          }
          break
        case "Escape":
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    }

    return (
      <div
        ref={ref}
        style={mergeStyles(resolveDot('relative w-full'), resolveDot(dotProp), style)}
        {...props}
      >
        <div style={resolveDot('relative')}>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="autocomplete-list"
            dot={`${sizeClasses[size]} pr-10`}
          />

          <div style={mergeStyles(resolveDot('absolute'), { right: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.25rem' })}>
            {loading || isSearching ? (
              <Icon
                      name="loader"
                className="h-4 w-4 animate-spin text-muted-foreground"
              />
            ) : clearable && inputValue ? (
              <button
                type="button"
                onClick={handleClear}
                style={resolveDot('rounded p-1')}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--muted))' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                aria-label="지우기"
              >
                <Icon name="close" className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* 드롭다운 */}
        {isOpen && (
          <div
            ref={dropdownRef}
            id="autocomplete-list"
            role="listbox"
            style={mergeStyles(
              resolveDot('absolute z-50 w-full mt-1 rounded-lg border overflow-hidden'),
              {
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                borderColor: 'hsl(var(--border))',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                maxHeight: `${maxHeight}px`,
              }
            )}
          >
            <div style={{ overflowY: 'auto', maxHeight: `${maxHeight}px` }}>
              {filteredOptions.length === 0 ? (
                <div style={resolveDot('px-4 py-8 text-center text-sm')} className="text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedIndex === index
                  const isValueSelected = value === option.value

                  return (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={isValueSelected}
                      onClick={() => handleOptionSelect(option)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={mergeStyles(
                        resolveDot('px-4 py-3 cursor-pointer'),
                        isSelected ? { backgroundColor: 'hsl(var(--primary) / 0.10)' } : undefined,
                        isValueSelected ? { backgroundColor: 'hsl(var(--primary) / 0.15)' } : undefined,
                      )}
                    >
                      <div style={resolveDot('flex items-center gap-3')}>
                        {option.icon && (
                          <div style={resolveDot('flex-shrink-0')} className="text-muted-foreground">
                            {option.icon}
                          </div>
                        )}
                        <div style={resolveDot('flex-1 min-w-0')}>
                          <div style={resolveDot('flex items-center gap-2')}>
                            <p style={resolveDot('text-sm font-medium')} className="text-foreground">
                              {option.label}
                            </p>
                            {isValueSelected && (
                              <Icon
                                name="check"
                                className="h-4 w-4 text-primary flex-shrink-0"
                              />
                            )}
                          </div>
                          {option.description && (
                            <p style={resolveDot('text-xs mt-0.5')} className="text-muted-foreground">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Autocomplete.displayName = "Autocomplete"


