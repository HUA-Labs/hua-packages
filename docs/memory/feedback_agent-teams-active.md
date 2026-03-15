---
name: feedback_agent-teams-active
description: Agent Teams를 적극적으로 사용하라는 피드백. 복잡한 작업 시 subagent 대신 팀 우선 고려.
type: feedback
---

Agent Teams를 적극적으로 사용할 것.

**Why:** 사용자가 멀티에이전트 작업의 가치를 인식하고, 복잡한 작업 시 팀 기반 병렬 처리를 선호함. 기존에는 "Opus 팀은 비싸니 subagent가 나음"이라는 교훈이 있었지만, 사용자가 적극 사용을 명시적으로 요청함.

**How to apply:**

- 독립적인 작업 3개 이상 → Agent Teams 우선 고려
- 단순 패턴 반복 → subagent 유지 (비용 효율)
- `/autopilot` 스킬의 parallel_threshold(2) 이상 독립 태스크 시 Agent Teams 사용
- 판단 필요한 독립 구현 작업 → Teams
- 검색/조회 성격 → subagent
