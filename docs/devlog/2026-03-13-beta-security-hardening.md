# Beta Security Hardening + dot Ecosystem — 2026-03-13

## Summary

Session 26-27. Agent Teams 활용하여 my-app 베타(3/26) 전 보안/품질 이슈 병렬 수정 →
코드 리뷰 4라운드 대응 → dot 에코시스템 확장 (MCP/LSP/VSCode) → 테스트 2245개.
PR #618 머지 완료, PR #619 생성.

## Changes

### CRITICAL (C1-C4) — security-critical agent

| #   | Issue                           | Fix                                                                                |
| --- | ------------------------------- | ---------------------------------------------------------------------------------- |
| C1  | Stored XSS in share-image       | `escapeHtml()` 적용 (emotionText, description, interpretation, reflectionQuestion) |
| C2  | error.message 클라이언트 노출   | `apiError('INTERNAL_ERROR')` 교체, console.error 유지 (5파일)                      |
| C3  | /api/health DB 에러 메시지 노출 | `'database unavailable'` 정적 문자열로 교체                                        |
| C4  | /api/guest/usage IP 노출        | 응답에서 `ip` 필드 + `getClientIP` import 제거                                     |

### HIGH (H1-H7) — hardening + error-migration agents

| #   | Issue                           | Fix                                                                |
| --- | ------------------------------- | ------------------------------------------------------------------ |
| H1  | apiError() 미사용 (60+ 라우트)  | `NextResponse.json({ error })` → `apiError()` 전면 마이그레이션    |
| H2  | 업로드 rate limit 없음          | `withRateLimit(handler, RATE_LIMIT_PRESETS.sensitive)` 적용        |
| H3  | 알림 엔드포인트 rate limit 없음 | 5개 sub-route에 `RATE_LIMIT_PRESETS.default` 적용                  |
| H5  | diary PUT 입력 검증 없음        | `UpdateDiaryRequestSchema` + `sanitizeInput()` + `sanitizeTitle()` |
| H6  | blog/sync 시크릿 미설정 시 스킵 | fail closed: `apiError('INTERNAL_ERROR')`                          |
| H7  | cron 시크릿 미설정 시 스킵      | 3개 cron 라우트 fail closed                                        |

### New Error Codes

- `ANNOUNCEMENT_NOT_FOUND` (404)
- `BLOG_NOT_FOUND` (404)

## Agent Teams 구성

| Teammate          | Tasks        | Files                                                                                    |
| ----------------- | ------------ | ---------------------------------------------------------------------------------------- |
| security-critical | C1-C4        | share-image, diary/[id], billing, quota, health, guest/usage, cron/cleanup-logs          |
| hardening         | H2-H3, H5-H7 | upload, notifications/_, diary/[id] PUT, blog/sync, cron/_                               |
| error-migration   | H1 batch 1-2 | contact, diary, draft, profile, admin-check, mobile-token, announcements, blog, admin/\* |

파일 충돌 없이 3명 병렬 수정 완료. 총 소요 ~30분.

## Session 27 — 코드 리뷰 대응 + dot 확장

### 리뷰 R1 (Codex)

- diary PUT date validation: `z.iso.datetime()` → lenient refine (YYYY-MM-DD 허용)
- profile error format: `data.error || data.message` fallback

### 리뷰 R2

- VSCode LSP 서버 경로: `resolveServer()` → bundled/node_modules/sibling 순 탐색 + `fs.existsSync`
- `@vscode/vsce` devDependency + `copy-server.mjs` 패키징 스크립트
- contact P2034: `TRANSACTION_CONFLICT` 에러 코드(409) 추가, 500 퇴화 복원

### 리뷰 R3

- **middleware.ts / proxy.ts 충돌**: Next.js 16은 proxy.ts만 지원 → middleware 삭제, auth 로직 proxy.ts에 머지
- **jose dependency**: devDependencies → dependencies 이동 → **my-app 빌드 최초 통과**
- vscode `prebuild:package` → `prepackage` 훅 수정

### 리뷰 R4

- `/api/manifest`, `/api/og` public allowlist 추가 (PWA/크롤러 401 회귀 수정)

### MCP/LSP 내부 리뷰 (6건 → 5/6 해결)

| #   | 이슈                              | 수정                         |
| --- | --------------------------------- | ---------------------------- |
| 1   | LSP 중복 토큰 diagnostic offset   | searchFrom 트래킹            |
| 2   | LSP variant/!important prefix     | strip 후 lookup              |
| 3   | VSCode client.start() 에러 핸들링 | catch + warning              |
| 4   | VSCode LSP 서버 경로 존재 확인    | fs.existsSync 3단계 탐색     |
| 5   | 따옴표 네스팅 regex               | 패턴 분리 (각 따옴표 타입별) |
| 6   | MCP not-sr-only                   | allowlist 추가               |

### dot 에코시스템 확장

- **dot-mcp**: MCP 서버 MVP — dot_resolve, dot_explain, dot_complete, dot_validate
- **dot-lsp**: LSP 서버 MVP — completion 5000+, hover, diagnostics
- **dot-vscode**: VS Code 확장 클라이언트 (bundled server 지원)
- **LSP 자동완성 감사**: filter/backdrop/grid/animation/transform ~170개 토큰 추가
- **전략 문서**: `docs/areas/roadmap/08-dot-ecosystem-strategy.md`

### 테스트

- 기존 실패 15건 수정 + 새 테스트 252개 추가
- **2044 → 2245** (all passing)

### 새 에러코드

- `ANNOUNCEMENT_NOT_FOUND`, `BLOG_NOT_FOUND`, `TRANSACTION_CONFLICT`

## PR 히스토리

| PR   | 내용                                                | 상태      |
| ---- | --------------------------------------------------- | --------- |
| #618 | 보안 하드닝 + 리뷰 4라운드 + dot MCP/LSP/VSCode     | ✅ Merged |
| #619 | LSP completion 확대 + filter/animation 테스트 201개 | Open      |
