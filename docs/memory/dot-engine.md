---
name: dot-engine
description: dot 크로스플랫폼 스타일 엔진 — 아키텍처, Phase 진행, 프리미티브, 마이그레이션 주의사항
type: project
---

## dot — 크로스플랫폼 스타일 엔진 (@hua-labs/dot)

- **이름 유래**: 점선면의 점. 스타일의 최소 단위.
- **목적**: Tailwind 의존 제거 + 웹/RN/Flutter/Compose/SwiftUI 동시 지원
- **API**: `dot('p-4 rounded-lg bg-primary-500')` → Web: CSSProperties / RN: StyleSheet 객체
- **아키텍처**: parser → resolver → runtime (web.ts / native.ts / class.ts)
- **보안/크로스플랫폼 설계**: [dot-cross-platform-security.md](./dot-cross-platform-security.md)
- **회사 코드 참조**: 이전 회사에서 JIT + arbitrary values CSS 빌드 도구 경험. 파서 로직 + 유틸리티 매핑 테이블 재활용 가능.
- **선행 조건**: dot이 있어야 hua-native, hue 크로스플랫폼 가능
- **BM 문서**: `docs/areas/bm-template/07-ecosystem-roadmap.md`

### Phase 진행 (2026-03-15 갱신)

| Phase | 범위                                                                                                      | 상태    |
| ----- | --------------------------------------------------------------------------------------------------------- | ------- |
| 1     | spacing, color, layout, sizing, typography, border                                                        | ✅ 완료 |
| 2     | shadow, opacity, transition, dark:                                                                        | ✅ 완료 |
| 3     | responsive (sm:/md:/lg:), hover:/focus:                                                                   | ✅ 완료 |
| 4     | gradient, filter, backdrop, grid, animation, positioning                                                  | ✅ 완료 |
| 5     | custom breakpoints, remBase, !important, drop-shadow, interactivity, table, list, scroll, divide, outline | ✅ 완료 |

**현재 상태**: 33 resolver, 25 token 파일, 3 adapter (web/native/flutter), 2,245 테스트 all pass
**다음**: Phase 6 — className→dot 마이그레이션, 미지원 토큰 19개 해소, plugin system

**미지원 토큰 (audit)**: `docs/areas/tasks/dot-unknown-tokens-audit.md` — 19개 (group, prose, animate-in, last: 등)

### 크로스플랫폼 프리미티브

- **Box** (`<div>`), **Text** (`<span>`), **Pressable** (`<button>`) — `packages/hua-ui/src/components/`
- `dot` prop으로 스타일, `as` prop으로 시맨틱 엘리먼트 변경, `forwardRef` 지원
- **현재 웹 전용** — 네이티브 지원 시 `.native.tsx` 파일 추가 (Metro 컨벤션)

### 마이그레이션 주의

- hua-ui 컴포넌트들이 `Omit<..., 'className'>` 사용 중 → className 대신 `dot` 또는 `style` 사용
- sum-companion 삭제됨 (2026-03-08, PR #567) → my-app-app으로 대체
