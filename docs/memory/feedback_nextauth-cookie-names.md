---
name: nextauth-v5-cookie-names
description: NextAuth v5 (Auth.js) uses authjs.session-token, NOT next-auth.session-token — proxy/middleware must match
type: feedback
---

NextAuth v5 (Auth.js) 쿠키 이름은 `authjs.session-token` / `__Secure-authjs.session-token`.
구 v4는 `next-auth.session-token` / `__Secure-next-auth.session-token`.

**Why:** Session 26에서 보안 하드닝 시 proxy.ts에 v4 쿠키 이름으로 세션 체크를 넣어서 모든 protected API가 401 차단됨. 프로덕션 배포 장애 발생.

**How to apply:** proxy.ts, middleware, 또는 세션 쿠키를 직접 체크하는 코드 작성 시 반드시 `auth-v5.ts`의 `cookies.sessionToken.name` 설정과 일치시킬 것. 현재: `authjs.session-token`.
