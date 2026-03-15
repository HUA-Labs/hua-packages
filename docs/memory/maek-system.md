---
name: maek-system
description: /maek 스킬 — Ralph Loop + Symphony 병합 자율 구현 시스템. 구조, 사용법, 기존 시스템과의 관계.
type: project
---

## /maek — 자율 구현 루프 (2026-03-15 생성)

Ralph Loop(컨텍스트 회전 + 파일 기반 상태) + Symphony(이슈→격리→검증 오케스트레이션) 패턴을 기존 HUA 스킬 시스템에 병합한 것.

**Why:** 기존 auto-impl, fix-issue, parallel-impl이 각각 존재하지만 묶는 오케스트레이터가 없었음. stuck 감지, 컨텍스트 회전, 진행 추적이 빠져있었음.

**How to apply:** 대규모 구현 작업 시 `/maek` 사용. 야간/장시간 작업은 `scripts/maek.sh` 외부 루프 사용.

### 파일 위치

- **스킬**: `.claude/skills/maek/SKILL.md`
- **외부 루프**: `scripts/maek.sh`
- **런타임 파일** (.gitignore됨): `.maek/progress.md`, `.maek/loop.log`, `.maek/config.md`

### 기존 시스템 재활용 맵

| maek 단계   | 재활용 대상                               |
| ----------- | ----------------------------------------- |
| 태스크 분해 | `/plan` 스킬                              |
| 단일 구현   | `auto-impl` subagent                      |
| 병렬 구현   | `parallel-impl` subagent 또는 Agent Teams |
| 이슈 처리   | `fix-issue` subagent                      |
| 검증        | `/typecheck` + `/build`                   |
| 커밋        | `/commit`                                 |

### Stuck 감지 (Gutter Detection)

- 같은 빌드 에러 3회 → 전략 전환
- 파일 edit→revert 2회 → 문제 재분석
- subagent 실패 3회 → 사용자 escalate
- progress.md 3 이터레이션 불변 → stuck 판정 (외부 루프)

### 사용법

```bash
# 세션 내
/maek                    # .maek/PRD.md 기반
/maek #123               # GitHub 이슈 기반

# 외부 루프 (컨텍스트 회전)
bash scripts/maek.sh --issue 123 --max-iterations 10
```

### 배경 지식

- **Ralph Loop**: Geoffrey Huntley 제안. `while :; do cat PROMPT.md | agent ; done`. 상태는 파일/git에. 컨텍스트 오염 시 fresh agent 회전.
- **Symphony**: OpenAI 2026-03 공개. Elixir/BEAM 기반 오케스트레이터. Linear 이슈 폴링 → 이슈별 워크스페이스 격리 → Codex 에이전트 실행. WORKFLOW.md로 정책 버전 관리. 아직 engineering preview.
- **우리 선택**: 둘 다 그대로 도입 안 함. 기존 22개 스킬 + subagent + Agent Teams 위에 빠진 조각(stuck 감지, 컨텍스트 회전, 진행 추적)만 추가.
