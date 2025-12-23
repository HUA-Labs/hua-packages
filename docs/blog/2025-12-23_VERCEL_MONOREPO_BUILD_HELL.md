# Vercel + 모노레포 빌드 지옥에서 살아남기 🔥

> Next.js 16 + Prisma 7.1 + pnpm 10 + Turbo = 빌드 실패의 향연

## 들어가며

오늘 하루종일 Vercel 빌드 오류랑 싸웠다;;  
로그는 짧고, 오류는 숨겨지고, 뭐가 문제인지 모르겠는 상황.

이 글은 **모노레포에서 Vercel 배포할 때 겪는 지옥**을 기록한 삽질 일지야.  
같은 고통을 겪는 분들에게 도움이 되길 바라며...

---

## 문제 상황: "뭐가 문제인지 모르겠어"

### 증상
```
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  my-app@0.1.0 build: `...`
Exit status 1
```

**끝.**

로그가 이게 전부야;; 뭐가 문제인지 안 알려줌.

### 환경
- Next.js 16.0.10
- Prisma 7.1.0
- pnpm 10.24.0
- Turbo (모노레포)
- Vercel

---

## 왜 문제가 숨겨졌을까? 🤔

이게 핵심이야.

Vercel은 모노레포를 감지하면 이런 명령어를 실행해:
```bash
pnpm --filter=my-app... run build
```

근데 이게 실패하면? pnpm이 **"뭔가 실패했음"**이라고만 알려주고 끝.  
Next.js나 Prisma의 실제 오류 메시지는 **래핑되어서 숨겨짐**.

### 해결: vercel.json으로 직접 명령어 지정

```json
{
  "buildCommand": "prisma generate && next build"
}
```

이렇게 하니까 드디어 실제 오류가 보였어!

```
Module not found: Can't resolve '@hua-labs/utils'
```

아하! 의존성 패키지가 빌드 안 됐구나!

---

## 삽질 여정 🛠️

### 시도 1: buildCommand에 의존성 빌드 순서 추가

```json
{
  "buildCommand": "cd ../.. && pnpm --filter=@hua-labs/utils run build && pnpm --filter=@hua-labs/i18n-core run build && ..."
}
```

**결과**: ❌ 실패

```
buildCommand should NOT be longer than 256 characters
```

ㅋㅋㅋ 256자 제한이 있었네;;

### 시도 2: Bash 쉘 스크립트

```bash
# scripts/vercel-build.sh
#!/bin/bash
cd ../..
pnpm --filter=@hua-labs/utils run build
# ...
```

**결과**: ❌ 미적용

> "노드에서 쉘스크립트가 먹어?"

맞는 말이야. Vercel은 Node.js 환경이라 bash 호환성이 불확실해.

### 시도 3: Node.js 스크립트

```javascript
// scripts/vercel-build.mjs
import { execSync } from 'child_process';
// ...
```

**결과**: ❌ 미적용

> "보통 버셀에서 별도 mjs js 만들면 문제가 생기던데"

경험에서 나온 통찰. ES Module 해석 문제, 경로 문제 등 함정이 많아.

### 시도 4: Turbo 직접 호출 ❌

잠깐, 우리 Turbo 쓰고 있잖아?  
Turbo가 의존성 순서 알아서 관리해주는데?

```json
{
  "buildCommand": "cd ../.. && turbo run build --filter=my-app..."
}
```

**결과**: ❌ **실패**

turbo.json에 일부 패키지 빌드 태스크가 누락되어 있었어;;  
태스크 추가해도 안 됨. Vercel 환경에서 turbo가 다르게 작동하는 듯.

### 시도 5: 성공했던 방식으로 롤백 ✅

결국 이전에 성공했던 커밋을 분석해봤어.  
`c07217db`, `188c9444` 둘 다 **스크립트로 직접 의존성 빌드**하는 방식이었음!

```javascript
// scripts/vercel-build.mjs
const packages = [
  '@hua-labs/utils',
  '@hua-labs/i18n-core',
  '@hua-labs/i18n-loaders',
  '@hua-labs/i18n-core-zustand',
  '@hua-labs/ui',
];

for (const pkg of packages) {
  run(`pnpm --filter=${pkg} run build`);
}

// 그 다음 prisma generate → next build
```

**결과**: ✅ **성공!**

---

## 핵심 학습 💡

### 1. Vercel의 pnpm --filter는 오류를 숨긴다

| 빌드 방식 | 오류 표시 |
|----------|----------|
| `pnpm --filter=... run build` | ❌ "뭔가 실패함"만 |
| `vercel.json` buildCommand | ✅ 실제 오류 메시지 |

**해결**: 항상 `vercel.json`에 buildCommand 명시!

### 2. Turbo도 만능이 아니다

Vercel이 "Detected Turbo"라고 했다고 안심하면 안 돼.  
turbo.json 설정이 복잡해지면 예상대로 작동 안 할 수 있어.

**해결**: 차라리 스크립트에서 **직접 빌드 순서를 명시**하는 게 확실해!

### 3. buildCommand 256자 제한

긴 명령어? 안 됨.  
쉘 스크립트? 호환성 문제.  
Node.js 스크립트? ES Module 함정.

**해결**: Turbo 같은 빌드 오케스트레이터 활용!

---

## 최종 설정

```json
// apps/my-app/vercel.json
{
  "buildCommand": "node scripts/vercel-build.mjs",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "framework": "nextjs"
}
```

```javascript
// apps/my-app/scripts/vercel-build.mjs
const packages = [
  '@hua-labs/utils',
  '@hua-labs/i18n-core',
  '@hua-labs/i18n-loaders',
  '@hua-labs/i18n-core-zustand',
  '@hua-labs/ui',
];

for (const pkg of packages) {
  run(`pnpm --filter=${pkg} run build`);
}

run('prisma generate --schema=./prisma/schema.prisma', appDir);
run('next build', appDir);
```

**핵심**: turbo.json에 의존하지 말고, **스크립트에서 직접 빌드 순서를 명시**하자!

---

## 결과: 성공! 🎉

```
✅ Build complete!
Traced Next.js server files in: 35.926ms
Created all serverless functions in: 642.404ms
Deployment completed
Build cache uploaded: 549.33 MB
```

드디어 성공했어! 하루종일 싸워서 이겼다 ㅋㅋ

---

## 마치며

모노레포 + Vercel 조합은 편하지만, 뭔가 잘못되면 지옥이야.  
특히 오류 메시지가 숨겨지면 디버깅이 정말 힘들어.

오늘의 교훈:
- 로그가 짧으면 의심해
- Vercel이 "Detected Turbo"라고 해도 믿지 마
- buildCommand 직접 지정해서 진짜 오류 확인

이 글이 같은 고통을 겪는 분들에게 도움이 되길!

**TL;DR**:
1. `vercel.json`에 buildCommand 명시해서 실제 오류 확인
2. 모노레포면 **스크립트로 의존성 빌드 순서 명시** (turbo.json 믿지 마)
3. 256자 제한 조심 → 스크립트 분리
4. 이전 성공 커밋 분석이 최고의 디버깅

---

**작성일**: 2025-12-23  
**태그**: #Vercel #모노레포 #NextJS #Prisma #pnpm #Turbo #빌드오류 #삽질 #성공

