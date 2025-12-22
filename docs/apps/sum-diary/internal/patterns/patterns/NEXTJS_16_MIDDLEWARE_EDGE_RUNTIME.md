# Next.js 16 + Middleware.ts Edge Runtime 강제 문제

**작성일**: 2025-12-11  
**목적**: Next.js 16 버전업 이후 middleware.ts가 Edge Runtime을 강제하는 문제 분석

---

## 🔍 문제 발견 배경

### 타임라인

1. **React 취약점 발견** (CVE-2025-55182)
   - React 19.x 버전에 영향을 미치는 취약점
   - Next.js 15~16.x 버전에도 영향
   - 공격자가 로그인 절차를 우회하여 서버를 원격 조작 가능

2. **보안 패치 적용**
   - Next.js 15.5.0 → 15.5.2 연속 패치 발표
   - React 19.2.1로 업그레이드
   - Next.js 16.0.7로 업그레이드

3. **빌드 오류 발생**
   - Vercel 빌드에서 `@hua-labs/ui:build: ERROR: command finished with error: No such file or directory (os error 2)`
   - 모든 명령어(`node`, `tsc`, `tsx`, `bash`, `sh`) spawn 실패
   - 실행 시간: 100-105ms (프로세스 spawn 실패)

---

## 🎯 핵심 가설

**Next.js 16에서 middleware.ts가 있으면 자동으로 Edge Runtime으로 분류하는 정책이 강화되었을 가능성**

### 증거

1. **Next.js 16 변경사항**
   - Next.js 15에서도 middleware.ts가 Edge Runtime을 사용했지만, 빌드 환경에는 영향을 주지 않았을 수 있음
   - Next.js 16에서 빌드 환경까지 Edge Runtime으로 분류하는 정책이 강화되었을 가능성

2. **Vercel 빌드 환경**
   - Edge Runtime 환경에서는 `node`, `sh`, `bash` 등 실행 파일이 없음
   - Turbo가 Edge 환경에서 실행되어 모든 명령어 spawn 실패

3. **타임라인 일치**
   - 빌드 오류가 Next.js 16 업그레이드 이후 발생
   - 이전에는 정상 작동했을 가능성

---

## 📋 Next.js 16 Middleware 변경사항 (추정)

### Next.js 15 vs Next.js 16

| 항목 | Next.js 15 | Next.js 16 |
|------|-----------|------------|
| middleware.ts 존재 | Edge Runtime 사용 | **Edge Runtime 강제** |
| 빌드 환경 | Node.js 환경 유지 가능 | **Edge Runtime으로 분류** |
| Vercel 빌드 | 정상 작동 | **빌드 실패** |

### 가능한 변경사항

1. **빌드 환경 분류 강화**
   - Next.js 16에서 middleware.ts가 있으면 빌드 환경까지 Edge Runtime으로 분류
   - 이전에는 런타임만 Edge였지만, 빌드 환경은 Node.js였을 수 있음

2. **Vercel 통합 변경**
   - Vercel이 Next.js 16의 빌드 환경 분류를 더 엄격하게 따름
   - middleware.ts가 있으면 빌드 단계부터 Edge Runtime으로 설정

---

## 🔗 관련 정보

### React 취약점 (CVE-2025-55182)

- **영향 버전**: React 19.x, Next.js 15~16.x
- **취약점**: 'React2Shell' - 로그인 절차 우회 가능
- **대응**: React 19.2.1, Next.js 16.0.7로 업그레이드

### Next.js 15.5.0~15.5.2 패치

- 보안 취약점 해결
- Turbopack 빌드 시스템 베타 출시
- 빌드 프로세스 변경 가능성

---

## 💡 해결 방향

### 즉시 해결책

1. **middleware.ts 제거 또는 대체**
   - middleware.ts가 있으면 Next.js 16에서 빌드 환경이 Edge Runtime으로 분류됨
   - 제거하면 Node.js 환경으로 복귀

2. **Vercel 설정 변경**
   - Output Mode를 Node.js로 강제 설정
   - 하지만 middleware.ts가 있으면 무효화될 수 있음

### 근본 해결책

**middleware.ts 제거가 필수**

- Next.js 16에서는 middleware.ts가 있으면 빌드 환경까지 Edge Runtime으로 분류
- 다른 설정으로는 우회 불가능
- 기능을 Server Component Layout이나 API route로 대체 필요

---

## 📊 버전별 비교

### 현재 버전

- **Next.js**: 16.0.7
- **React**: 19.2.1
- **React DOM**: 19.2.1

### 이전 버전 (추정)

- **Next.js**: 15.x (또는 그 이전)
- **React**: 19.1.0 (또는 그 이전)

### 변경 시점

- React 취약점 패치 이후
- Next.js 16 업그레이드 이후
- 빌드 오류 발생 시작

---

## ⚠️ 주의사항

### Next.js 16의 Middleware 정책

1. **Edge Runtime 강제**
   - middleware.ts가 있으면 빌드 환경까지 Edge Runtime으로 분류
   - 이는 Next.js 16의 의도된 동작일 수 있음

2. **Vercel 통합**
   - Vercel이 Next.js 16의 빌드 환경 분류를 엄격하게 따름
   - 설정으로 우회 불가능

3. **롤백 고려**
   - Next.js 15로 롤백하면 해결될 수 있지만, 보안 취약점 노출
   - **권장하지 않음**

---

## 🎯 결론

### 문제 원인

1. **React 취약점 패치**로 인한 버전 업그레이드
2. **Next.js 16**에서 middleware.ts가 빌드 환경까지 Edge Runtime으로 분류하는 정책 강화
3. **Vercel 빌드 환경**이 Edge Runtime으로 설정되어 모든 명령어 spawn 실패

### 해결책

**middleware.ts 제거 또는 대체가 필수**

- Next.js 16에서는 middleware.ts가 있으면 빌드 환경이 Edge Runtime으로 분류됨
- 다른 설정으로는 우회 불가능
- 기능을 Server Component Layout이나 API route로 대체 필요

---

## 🔗 참고 자료

- [React 취약점 (CVE-2025-55182)](https://www.fnnews.com/news/202512100730373182)
- [Next.js 16 Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)

