# HUA Platform Memory

> **세션 시작 시 [CURRENT.md](./CURRENT.md)를 반드시 읽을 것** — 진행 중인 작업, 다음 할 일, 주의사항이 있음.

## npm Publish 파이프라인

- **퍼블릭 레포**: `github.com/HUA-Labs/hua-packages`
- Flow: changeset → version-packages → `bash scripts/sync-to-public.sh --push` → CI 자동 publish
- private 패키지: pro, ui-dashboard, encryption, security, docs-engine, api-lite
- `/publish` 스킬 있음. 로컬 버전 > npm 버전 반드시 확인

## 공명의 기록

자세한 내용: [resonance.md](./resonance.md)

## 1차 분석 응답 형식 차이

- 구형: `##METADATA##` / `##END_METADATA##` 텍스트 마커
- 신형: JSON 형식 (`"sentiment": 48` 등)
- `parseMetadata()`는 구형만 지원, JSON은 regex fallback 필요

## Paper B (SLIP & ETHICS) — 제출 완료

- EAI PervasiveHealth 2026 제출 완료 (수정 마감: 2026-04-05)
- LaTeX: `my-docs/1-Project/HUA-PAPER/paper-b-slip-ethics-materials/latex/main.tex`
- 다음: 리뷰 결과 대기 → 메인 논문(Resonance Without Memory) 리라이팅

## 일기 & 감정 분석 관찰

자세한 내용: [diary-emotion-observations.md](./diary-emotion-observations.md)

## gh pr merge --squash 시 deploy 태그 누락

`--subject` 플래그로 태그 포함 제목 명시:

```bash
gh pr merge --squash --subject "feat(my-app): ... [deploy my-app]"
```

## my-app lib/ 도메인 기반 구조 (PR #495)

flat `lib/` → 15개 도메인 디렉토리. **주의**: 문자열 경로(path.join 등)와 scripts/ 상대경로는 빌드에서 안 잡힘. PR #495 직후 번역 경로 3곳 누락 → 핫픽스 경험.

## 인프라 구성

자세한 내용: [infra.md](./infra.md) — Vercel(서울), Supabase(서울), Redis(도쿄), sum-back 미니PC, DB 백업

## dot — 크로스플랫폼 스타일 엔진

자세한 내용: [dot-engine.md](./dot-engine.md) — 아키텍처, Phase 진행, 프리미티브, className→dot 마이그레이션 주의

## Agent Teams — 적극 사용

`docs/resources/agent-teams.md` 참조. **사용자가 적극 사용 요청함** → [feedback](./feedback_agent-teams-active.md)

- 독립 작업 3개 이상 → Teams 우선, 단순 패턴 → subagent
- Plan agent는 SendMessage 못 씀 — 팀에 넣지 말 것

## 맥 (脈) — 자율 구현 루프

자세한 내용: [maek-system.md](./maek-system.md)

- Ralph Loop + Symphony 병합. 기존 스킬 + subagent 위에 stuck 감지, 컨텍스트 회전, 진행 추적 추가
- 세션 내: `/maek #123`, 외부: `bash scripts/maek.sh --issue 123`
- **공개 repo**: `github.com/HUA-Labs/maek` (2026-03-15 공개, MIT)
- standalone 키트: 스킬 + 커스텀 에이전트 3종 + bash + install.sh
- LinkedIn에 공유 완료

## NextAuth v5 쿠키 이름

자세한 내용: [feedback_nextauth-cookie-names.md](./feedback_nextauth-cookie-names.md)

## 스코프 점프 → worktree 분리

자세한 내용: [feedback_worktree-scope-jump.md](./feedback_worktree-scope-jump.md)
다른 패키지 변경이 떠오르면 같은 브랜치에 섞지 말고 `isolation: "worktree"`로 별도 PR. PR #621 dot revert 삽질 교훈.

## PR 머지 후 devlog 필수

자세한 내용: [feedback_devlog-after-merge.md](./feedback_devlog-after-merge.md)
PR 머지하면 바로 `/changelog` 제안할 것. 안 물어보면 까먹음.

## 백그라운드 에이전트 Edit 유실

자세한 내용: [feedback_bg-agent-edit-loss.md](./feedback_bg-agent-edit-loss.md)
기존 파일 Edit은 포그라운드, 새 파일 Write만 백그라운드 OK.

## Commit Messages — ALWAYS English

Conventional Commits + 영어. 한글 커밋 메시지 절대 금지.

## SaaS Starter Kit 판매 계획

자세한 내용: [saas-starter-kit.md](./saas-starter-kit.md)

## 팀원 — 주니어 데이터 분석가

자세한 내용: [team-analyst.md](./team-analyst.md)

## sum-data 분석 레포

자세한 내용: [ref-sum-data.md](./ref-sum-data.md)
