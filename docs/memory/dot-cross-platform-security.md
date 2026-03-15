---
name: dot cross-platform security architecture
description: dot 엔진 5개 플랫폼(Web/RN/Flutter/Compose/SwiftUI) 보안 설계 방향 — 파서 레벨 화이트리스트, 어댑터별 출력 분리
type: project
---

## 5개 타겟 플랫폼

1. **Web CSS** (dotCSS/dotClass) — @media, :hover, className + `<style>` 주입
2. **Web Inline** (dot) — CSSProperties
3. **React Native** (dotNative) — StyleSheet, JS 기반 반응형
4. **Flutter** — Widget props, EdgeInsets, MediaQuery
5. **Jetpack Compose** — Modifier chain, dp/sp
6. **SwiftUI** — ViewModifier, GeometryReader

## 보안 아키텍처 결정 (2026-03-12)

**핵심 원칙: 토큰 스펙 = 보안 경계. 파서에서 검증, 어댑터는 신뢰.**

```
토큰 → [파서: 화이트리스트 검증] → 추상 토큰 → 어댑터 → 플랫폼 출력
```

- **블랙리스트(X)**: CSS unicode escape, 대소문자 변형 등으로 우회 가능
- **화이트리스트(O)**: 허용 패턴만 통과, 나머지 전부 거부
- arbitrary value `[...]`에서 `()`, `<>`, `@`, `\`, `;` 등 차단
- 6개 어댑터 각각에서 소독할 필요 없음

## 반응형 플랫폼별 메커니즘

같은 토큰 `md:p-8`이 플랫폼별로 다른 출력:

- Web: `dotCSS()` → `@media (min-width: 768px)` CSS 쿼리
- RN: `dot(..., { breakpoint })` → JS Dimensions API로 감지
- Flutter/Compose/Swift: 각 플랫폼 MediaQuery 등가물

## CSS 주입 (Web)

- `DotStyleRegistry` + `useServerInsertedHTML` (Next.js App Router 정석)
- 컴포넌트: `dotClass()` → className만 반환
- 레이아웃: `dotFlush()` → 전체 CSS 수집/주입
- 컴포넌트별 `<style>` 태그 불필요

## 장기 로드맵

TS 파서 → 추후 Rust 코어 + FFI 바인딩 or 빌드타임 코드젠으로 전환 가능.
파서 로직이 플랫폼 무관하게 설계되어 있으면 포팅 비용 최소화.
