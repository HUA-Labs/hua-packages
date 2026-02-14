"use client"

import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { merge } from "../lib/utils"
import { Container, type ContainerProps } from "./Container"

export const sectionVariants = cva("relative w-full", {
  variants: {
    spacing: {
      none: "",
      sm: "py-12 sm:py-16",
      md: "py-16 sm:py-20 lg:py-24",
      lg: "py-20 sm:py-28",
      xl: "py-28 sm:py-36",
    },
    background: {
      none: "",
      muted: "bg-muted/30",
      accent: "bg-accent/5",
      primary: "bg-primary/5",
    },
  },
  defaultVariants: { spacing: "lg", background: "none" },
})

export interface SectionHeaderConfig {
  title: string
  subtitle?: string
  action?: React.ReactNode
  /** section-line 데코레이터 표시 @default true */
  decorator?: boolean
  /** 텍스트 정렬 @default 'center' */
  align?: 'left' | 'center'
}

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** Container 사이즈 @default 'lg' */
  container?: ContainerProps['size']
  /** Container 패딩 @default 'none' */
  containerPadding?: ContainerProps['padding']
  /** 섹션 헤더 설정 */
  header?: SectionHeaderConfig
  /** 풀위드 모드 (Container 없이 직접) */
  fullWidth?: boolean
}

const sectionLineStyle: React.CSSProperties = {
  width: '80px',
  height: '3px',
  borderRadius: '9999px',
  background: 'linear-gradient(90deg, var(--color-primary, hsl(var(--primary))), var(--color-accent, hsl(var(--accent-foreground))))',
  marginBottom: '1.5rem',
}

function SectionHeader({ config }: { config: SectionHeaderConfig }) {
  const isCenter = config.align !== 'left'

  return (
    <div className={merge("mb-16", isCenter && "text-center")}>
      {config.decorator !== false && (
        <div
          style={sectionLineStyle}
          className={merge(isCenter && "mx-auto")}
          aria-hidden="true"
        />
      )}
      <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
        {config.title}
      </h2>
      {config.subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {config.subtitle}
        </p>
      )}
      {config.action && (
        <div className="mt-6">{config.action}</div>
      )}
    </div>
  )
}

/**
 * Section 컴포넌트
 *
 * 랜딩 페이지 섹션의 보일러플레이트를 줄이는 시맨틱 래퍼.
 * 내부적으로 Container를 사용하며, header prop으로 제목/부제/데코레이터를 자동 생성합니다.
 *
 * @example
 * <Section header={{ title: "제목", subtitle: "부제" }}>
 *   {children}
 * </Section>
 *
 * <Section spacing="xl" background="muted" fullWidth>
 *   {fullWidthContent}
 * </Section>
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({
    className,
    spacing,
    background,
    container = "lg",
    containerPadding = "none",
    header,
    fullWidth = false,
    children,
    ...props
  }, ref) => {
    const content = (
      <>
        {header && <SectionHeader config={header} />}
        {children}
      </>
    )

    return (
      <section
        ref={ref}
        className={merge(
          sectionVariants({ spacing, background }),
          "px-6",
          className
        )}
        {...props}
      >
        {fullWidth ? content : (
          <Container size={container} padding={containerPadding} centered>
            {content}
          </Container>
        )}
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }
