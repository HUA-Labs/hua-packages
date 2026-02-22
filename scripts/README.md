# Scripts

## 핵심 (워크플로우에서 사용)

| 스크립트 | 명령어 | 용도 |
|----------|--------|------|
| `generate-docs.ts` | `pnpm generate:docs` | doc.yaml → README.md + ai.yaml 자동 생성 |
| `generate-pr.ts` | `pnpm generate:pr` | PR 템플릿 생성 (`/pr` 스킬) |
| `generate-devlog.ts` | `pnpm generate:devlog` | devlog 스캐폴딩 (`/devlog` 스킬) |
| `sync-to-public.sh` | `bash scripts/sync-to-public.sh --push` | 프라이빗→퍼블릭 레포 동기화 (npm publish 파이프라인) |

## Publish 파이프라인

| 스크립트 | 용도 |
|----------|------|
| `sync-to-public.sh` | pro strip, changeset 정리, workspace:* 변환, 퍼블릭 push |
| `prepare-publish.js` | 배포 전 검증 |
| `restore-workspace.js` | publish 후 workspace 복원 |

> Flow: changeset → version-packages → commit → `bash scripts/sync-to-public.sh --push` → 퍼블릭 CI 자동 publish

## 분석 도구 (1회성/수동)

| 스크립트 | 용도 |
|----------|------|
| `analyze-export.js` | 패키지 export 분석 |
| `analyze-persona-test.js` | 페르소나 테스트 결과 분석 (논문용) |
| `deployment-status.ts` | 배포 상태 확인 |

## 기타

| 파일 | 용도 |
|------|------|
| `templates/` | devlog, PR 등 스캐폴딩 템플릿 |
| `tsconfig.json` | 스크립트용 TS 설정 |
