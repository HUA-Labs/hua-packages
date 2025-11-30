# Next.js 16 업그레이드 검증 가이드

## 📋 개요

이 문서는 Next.js 16 업그레이드 후 실제로 검증해야 할 항목들을 단계별로 안내합니다.

**대상 브랜치:** `feat/upgrade-nextjs-16`  
**업그레이드 버전:** Next.js 15.4.3 → 16.0.4

---

## 🚀 빠른 시작: 기본 검증

### 1단계: 빌드 테스트

각 앱에서 빌드가 성공하는지 확인합니다.

```bash
# my-api 빌드 테스트
cd apps/my-api
pnpm build

# my-chat 빌드 테스트
cd apps/my-chat
pnpm build

# my-app 빌드 테스트
cd apps/my-app
pnpm build

# hua-labs 빌드 테스트
cd apps/hua-labs
pnpm build
```

**예상 결과:**
- ✅ 빌드 성공 (에러 없음)
- ⚠️ 경고는 있을 수 있지만 빌드는 성공해야 함

**문제 발생 시:**
- 빌드 에러가 발생하면 에러 메시지를 기록하고 롤백 검토

---

### 2단계: 타입 체크

TypeScript 타입 에러가 없는지 확인합니다.

```bash
# 루트에서 전체 타입 체크
cd /path/to/hua-platform
pnpm type-check
```

**예상 결과:**
- ✅ 타입 에러 없음

---

### 3단계: 개발 서버 실행

각 앱의 개발 서버가 정상적으로 시작되는지 확인합니다.

```bash
# my-api 개발 서버
cd apps/my-api
pnpm dev
# 브라우저에서 http://localhost:3000 접속 확인

# my-chat 개발 서버
cd apps/my-chat
pnpm dev
# 브라우저에서 http://localhost:3000 접속 확인

# my-app 개발 서버
cd apps/my-app
pnpm dev
# 브라우저에서 http://localhost:3000 접속 확인
```

**확인 사항:**
- [ ] 서버가 정상적으로 시작됨
- [ ] 브라우저에서 페이지가 정상적으로 로드됨
- [ ] 콘솔에 치명적인 에러가 없음
- [ ] Turbopack이 기본으로 사용됨 (Next.js 16의 변경사항)

---

## 🔐 핵심 기능 검증

### NextAuth 동작 확인

Next.js 16과 `next-auth 4.24.x`의 호환성을 확인합니다.

#### my-chat 앱

```bash
cd apps/my-chat
pnpm dev
```

**테스트 시나리오:**
1. [ ] 로그인 페이지 접속 (`/api/auth/signin`)
2. [ ] 이메일/비밀번호 로그인 시도
3. [ ] 로그인 성공 후 세션 유지 확인
4. [ ] 로그아웃 기능 정상 동작
5. [ ] OAuth 로그인 (Kakao, Google) 정상 동작 (선택)

#### my-app 앱

```bash
cd apps/my-app
pnpm dev
```

**테스트 시나리오:**
1. [ ] 로그인 페이지 접속
2. [ ] 로그인 성공 후 대시보드 접근
3. [ ] 세션 기반 인증 정상 동작
4. [ ] 보호된 라우트 접근 정상 동작
5. [ ] 로그아웃 기능 정상 동작

**문제 발생 시:**
- 로그인/로그아웃이 동작하지 않으면 `next-auth` 호환성 문제 가능
- Next.js 15.4.3으로 롤백 검토

---

### API Routes 동작 확인

각 앱의 주요 API 엔드포인트가 정상적으로 응답하는지 확인합니다.

#### my-api 앱

```bash
cd apps/my-api
pnpm dev
```

**테스트할 API:**
```bash
# 사용자 정보 조회
curl http://localhost:3000/api/user/current

# API 키 목록 조회
curl http://localhost:3000/api/user/api-keys

# 크레딧 잔액 조회
curl http://localhost:3000/api/credit/balance
```

**확인 사항:**
- [ ] API가 정상적으로 응답함 (200 OK)
- [ ] 에러 응답이 적절한 형식으로 반환됨
- [ ] 인증이 필요한 API는 인증 에러 반환 (401)

#### my-app 앱

```bash
cd apps/my-app
pnpm dev
```

**테스트할 API:**
```bash
# 일기 목록 조회
curl http://localhost:3000/api/diary

# 일기 생성
curl -X POST http://localhost:3000/api/diary/create \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"테스트 내용"}'

# 알림 목록 조회
curl http://localhost:3000/api/notifications
```

**확인 사항:**
- [ ] CRUD 작업이 정상적으로 동작함
- [ ] 인증이 필요한 API는 인증 체크 정상 동작
- [ ] 에러 핸들링이 정상적으로 동작함

---

### Middleware 동작 확인

`my-app` 앱의 middleware가 정상적으로 동작하는지 확인합니다.

```bash
cd apps/my-app
pnpm dev
```

**테스트 시나리오:**
1. [ ] Rate limiting 정상 동작
   - 빠른 연속 요청 시 429 에러 반환 확인
2. [ ] 인증 체크 정상 동작
   - 보호된 경로 접근 시 인증 리다이렉트 확인
3. [ ] IP 기반 제한 정상 동작
   - 의심스러운 User-Agent 차단 확인

**테스트 방법:**
```bash
# Rate limiting 테스트 (15분 내 100회 제한)
for i in {1..101}; do
  curl http://localhost:3000/api/diary
  sleep 0.1
done
# 마지막 요청에서 429 에러 확인
```

---

## ⚡ Next.js 16 특화 검증

### Turbopack 동작 확인

Next.js 16에서는 개발 모드에서 Turbopack이 기본으로 사용됩니다.

```bash
cd apps/my-api  # 또는 다른 앱
pnpm dev
```

**확인 사항:**
- [ ] 개발 서버 시작 시 Turbopack 사용 메시지 확인
- [ ] Hot Module Replacement (HMR) 정상 동작
  - 파일 수정 시 자동으로 변경사항 반영
- [ ] Fast Refresh 정상 동작
  - React 컴포넌트 수정 시 상태 유지하며 업데이트

**비교:**
- 이전 버전(Webpack) 대비 시작 속도가 더 빠른지 확인
- HMR 속도가 더 빠른지 확인

---

### Server Components 동작 확인

Server Components가 정상적으로 렌더링되는지 확인합니다.

**확인 방법:**
1. [ ] 페이지 소스 보기에서 서버 컴포넌트 HTML 확인
2. [ ] 클라이언트 컴포넌트 하이드레이션 정상 동작
3. [ ] 서버 컴포넌트에서 데이터 페칭 정상 동작

**테스트:**
```bash
# my-app 앱에서 일기 목록 페이지 확인
# 서버에서 데이터를 가져와 렌더링되는지 확인
```

---

### 캐싱 동작 확인

Next.js 16의 새로운 캐싱 전략이 정상적으로 동작하는지 확인합니다.

**확인 사항:**
- [ ] 정적 페이지가 적절히 캐싱됨
- [ ] 동적 라우트가 적절히 캐싱됨
- [ ] API 응답이 적절히 캐싱됨

**테스트:**
```bash
# 같은 API를 여러 번 호출하여 캐싱 확인
curl http://localhost:3000/api/diary
# 응답 헤더에서 Cache-Control 확인
```

---

### Metadata API 동작 확인

페이지 메타데이터가 정상적으로 생성되는지 확인합니다.

**확인 방법:**
1. [ ] 브라우저 개발자 도구에서 `<head>` 태그 확인
2. [ ] Open Graph 태그 정상 생성 확인
3. [ ] SEO 메타데이터 정상 생성 확인

**테스트:**
```bash
# 페이지 소스에서 메타 태그 확인
curl http://localhost:3000 | grep -i "meta"
```

---

## 📊 성능 및 안정성 검증

### 빌드 성능 확인

```bash
# 빌드 시간 측정
time pnpm build

# 번들 크기 확인
pnpm build
# .next 폴더의 크기 확인
```

**비교 항목:**
- [ ] 빌드 시간 (이전 버전과 비교)
- [ ] 번들 크기 (이전 버전과 비교)
- [ ] 빌드 출력물 검증

---

### 런타임 성능 확인

**확인 사항:**
- [ ] 페이지 로딩 속도 (Lighthouse 사용)
- [ ] API 응답 시간
- [ ] 메모리 사용량

**테스트:**
```bash
# Lighthouse로 성능 측정
npx lighthouse http://localhost:3000 --view
```

---

### 에러 로그 확인

**확인 사항:**
- [ ] 브라우저 콘솔에 에러 없음
- [ ] 서버 로그에 에러 없음
- [ ] 클라이언트 에러 로그 없음

**확인 방법:**
1. 브라우저 개발자 도구 콘솔 확인
2. 터미널 서버 로그 확인
3. 프로덕션 환경 에러 모니터링 (있는 경우)

---

## 🔄 롤백 절차

문제가 발생하여 롤백이 필요한 경우:

### 1. 현재 변경사항 확인

```bash
git status
git log --oneline -10
```

### 2. Next.js 15.4.3으로 롤백

```bash
# 모든 앱에서 Next.js 15.4.3으로 다운그레이드
pnpm up next@15.4.3 --recursive --filter "./apps/*"

# pnpm-lock.yaml 업데이트
pnpm install
```

### 3. 롤백 후 검증

```bash
# 빌드 테스트
pnpm build

# 개발 서버 테스트
pnpm dev
```

---

## 📝 검증 결과 기록

검증 완료 후 다음 정보를 기록합니다:

### 검증 결과 템플릿

```markdown
## Next.js 16 업그레이드 검증 결과

**검증 일자:** YYYY-MM-DD
**검증자:** [이름]

### 빌드 테스트
- [ ] my-api: ✅ / ❌
- [ ] my-chat: ✅ / ❌
- [ ] my-app: ✅ / ❌
- [ ] hua-labs: ✅ / ❌

### 핵심 기능
- [ ] NextAuth: ✅ / ❌
- [ ] API Routes: ✅ / ❌
- [ ] Middleware: ✅ / ❌

### Next.js 16 특화 기능
- [ ] Turbopack: ✅ / ❌
- [ ] Server Components: ✅ / ❌
- [ ] 캐싱: ✅ / ❌

### 발견된 문제 및 해결 방법

#### 1. Toast 컴포넌트 CSS 주입 문제

**문제:**
- `Toast` 컴포넌트에서 `dangerouslySetInnerHTML`을 사용한 CSS 주입이 Next.js 16 빌드에서 에러 발생
- `@keyframes` 애니메이션이 빌드 시점에 처리되지 않음

**해결:**
- `useEffect`를 사용하여 클라이언트 사이드에서만 스타일을 동적으로 주입
- `typeof window !== 'undefined'` 체크 추가

**파일:** `packages/hua-ui/src/components/Toast.tsx`

#### 2. 서버 컴포넌트에서 클라이언트 컴포넌트 사용 문제

**문제:**
- `ToastProvider`, `ScrollToTop` 등 클라이언트 전용 컴포넌트를 서버 컴포넌트(`app/layout.tsx`)에서 직접 import하면 에러 발생
- `createContext`는 클라이언트 컴포넌트에서만 사용 가능

**해결:**
- 클라이언트 컴포넌트를 별도 파일로 분리 (`ClientComponents.tsx`)
- `Providers` 컴포넌트 내부에 `ToastProvider` 포함
- 서버 컴포넌트에서는 클라이언트 래퍼 컴포넌트만 import

**변경된 파일:**
- `apps/my-app/app/components/layout/providers.tsx` - `ToastProvider` 추가
- `apps/my-app/app/components/layout/ClientComponents.tsx` - `ScrollToTop` 래퍼 생성
- `apps/my-app/app/layout.tsx` - 클라이언트 컴포넌트 직접 import 제거

#### 3. Next.js 16 Turbopack vs Webpack 충돌

**문제:**
- Next.js 16에서 Turbopack이 기본값이지만, webpack 설정이 있어 충돌 발생
- `ERROR: This build is using Turbopack, with a webpack config and no turbopack config.`

**해결:**
- 빌드 스크립트에 `--webpack` 플래그 추가
- `package.json`의 `build` 스크립트 수정: `"build": "next build --webpack"`

**적용된 앱:**
- `apps/my-api/package.json`
- `apps/my-chat/package.json`
- `apps/my-app/package.json`

#### 4. pages와 app 디렉토리 공존 문제

**문제:**
- Next.js 16에서는 `pages`와 `app` 디렉토리를 같은 폴더에 둘 수 없음
- `my-chat`에 사용하지 않는 `pages/_app.tsx` 파일 존재

**해결:**
- 사용하지 않는 `pages/_app.tsx` 파일을 `_app.tsx.bak`으로 이름 변경
- 또는 완전히 삭제 (백업 후)

**파일:** `apps/my-chat/pages/_app.tsx` → `_app.tsx.bak`

#### 5. Tailwind CSS 4.0 마이그레이션

**변경사항:**
- 모든 앱의 Tailwind CSS를 3.x → 4.0으로 업그레이드
- `@tailwindcss/postcss` 패키지 추가 및 PostCSS 설정 업데이트
- `@tailwind` 지시어를 `@import "tailwindcss"`로 변경
- 플러그인도 CSS에서 `@import`로 로드

**변경된 파일:**
- 모든 앱의 `package.json` - `tailwindcss: "^4"`, `@tailwindcss/postcss: "^4"` 추가
- 모든 앱의 `postcss.config.js` - `'@tailwindcss/postcss': {}` 사용
- 모든 앱의 `globals.css` - `@import "tailwindcss"` 사용
- 모든 앱의 `tailwind.config.js` - 단순화 (content만 유지)

**참고:** 자세한 내용은 [TAILWIND_CSS_4_MIGRATION.md](./TAILWIND_CSS_4_MIGRATION.md) 참조

### 결론
- [ ] 프로덕션 배포 가능
- [ ] 추가 수정 필요
- [ ] 롤백 필요
```

---

## 🎯 우선순위별 검증 순서

### 필수 (즉시 확인)

1. ✅ 빌드 테스트
2. ✅ 타입 체크
3. ✅ 개발 서버 실행
4. ✅ NextAuth 기본 동작

### 중요 (1일 내 확인)

5. ✅ API Routes 동작
6. ✅ Middleware 동작
7. ✅ 주요 기능 E2E 테스트

### 권장 (1주일 내 확인)

8. ✅ Turbopack 성능
9. ✅ Server Components 동작
10. ✅ 캐싱 동작
11. ✅ 성능 벤치마크

---

## 💡 참고사항

1. **Peer Dependency 경고**: `next-auth` 경고는 발생하지만 실제 동작에는 문제가 없을 수 있습니다.

2. **점진적 검증**: 모든 앱을 한 번에 검증하지 말고, 하나씩 검증하는 것이 안전합니다.

3. **롤백 준비**: 문제 발생 시 빠르게 롤백할 수 있도록 준비해두세요.

4. **문서화**: 발견한 문제나 개선사항은 반드시 문서화하세요.

---

## 🔗 관련 문서

- [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) - 의존성 관리 전략
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16) - 공식 업그레이드 가이드

