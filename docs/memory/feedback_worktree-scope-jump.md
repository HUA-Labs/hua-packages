---
name: worktree-scope-jump
description: 스코프 벗어나는 작업은 worktree로 분리 — 모노레포 PR 오염 방지
type: feedback
---

작업 중 다른 패키지/스코프 작업이 떠오르면 같은 브랜치에 커밋하지 말고, `isolation: "worktree"`로 별도 브랜치에서 처리할 것.

**Why:** 대표님 스타일이 갑자기 다른 스코프로 점프하는 경우가 잦음 (예: my-app 결제 작업 중 dot 패키지 토큰 수정). 모노레포라서 한 브랜치에 섞이면 PR 리뷰에서 걸리고, revert/분리 작업이 생김. 실제로 PR #621에서 dot 커밋 revert 삽질 경험.

**How to apply:**

- "이것도 해야겠다"가 현재 PR 스코프 밖이면 → "worktree에서 별도 브랜치로 해줘" 제안
- Agent tool에 `isolation: "worktree"` 사용 → 독립 복사본에서 작업 → 별도 PR
- 메인 작업 흐름 안 끊기고, PR도 깔끔하게 분리
- 판단 기준: 다른 `packages/` 디렉토리 변경이면 거의 무조건 분리
