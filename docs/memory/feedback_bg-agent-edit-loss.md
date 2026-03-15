---
name: feedback_bg-agent-edit-loss
description: 백그라운드 auto-impl 에이전트에서 기존 파일 Edit 유실 — 소스 수정은 포그라운드로
type: feedback
---

백그라운드 auto-impl 에이전트에서 기존 파일 Edit이 반영 안 되는 케이스 발생. 새 파일 Write는 정상.

**Why:** 2026-03-15 세션에서 registry.tsx, validator.ts 등 기존 파일 Edit이 에이전트 완료 후 디스크에 반영 안 됨. 테스트 파일(새 파일)은 정상 생성됨.

**How to apply:** 기존 파일 수정이 필요한 에이전트는 `run_in_background: false` (포그라운드)로 실행. 새 파일만 만드는 작업(테스트 추가 등)은 백그라운드 OK.
