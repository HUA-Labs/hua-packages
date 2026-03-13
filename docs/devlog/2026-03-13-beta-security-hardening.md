# Beta Security Hardening — 2026-03-13

## Summary

Agent Teams (3 teammates) 활용하여 my-app 베타(3/26) 전 보안/품질 이슈 병렬 수정.
66개 파일 수정, 670줄 삭제 296줄 추가. 에러 응답 시스템 통합 완료.

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

## Known Issues (Pre-existing)

- `jose` / `@panva/hkdf` module not found — `mobile-auth.ts` 관련, main에서도 동일. 별도 수정 필요.

## Not Done (Next Session)

- H8: middleware.ts 글로벌 인증 미들웨어 (Edge Runtime 제약 고려 필요)
- M1-M7: Medium 이슈 (stack trace, SVG upload, CORS)
