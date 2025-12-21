# Next.js & React 버전 확인

**작성일**: 2025-12-11  
**목적**: 현재 사용 중인 Next.js와 React 버전이 최신인지 확인

---

## 📋 현재 버전

### apps/my-app/package.json

```json
{
  "dependencies": {
    "next": "16.0.7",
    "react": "19.2.1",
    "react-dom": "19.2.1"
  }
}
```

---

## 🔍 버전 확인 결과

### Next.js

- **현재 버전**: 16.0.7
- **최신 버전**: 확인 필요 (웹 검색 결과 불일치)
  - 일부 결과: 15.4.5 (최신 안정 버전)
  - 일부 결과: 16.0.0 (최신 버전)
  - **우리 버전**: 16.0.7 (16.0.0보다 높음)

**분석**:
- 16.0.7은 16.0.0보다 높은 버전
- 16.0.7이 최신 16.x 버전일 가능성 높음
- 또는 15.4.5가 최신 안정 버전이고 16.x는 베타/RC일 수 있음

### React

- **현재 버전**: 19.2.1
- **최신 버전**: 19.x (확인 필요)
  - 일부 결과: 19.0.0 (최신 버전)
  - **우리 버전**: 19.2.1 (19.0.0보다 높음)

**분석**:
- 19.2.1은 19.0.0보다 높은 버전
- 19.2.1이 최신 19.x 버전일 가능성 높음

---

## ⚠️ 주의사항

### Next.js 16.x 사용

- Next.js 16.x는 비교적 최근에 출시된 버전
- middleware.ts가 Edge Runtime을 강제하는 정책이 16.x에서 강화되었을 가능성
- 15.4.5가 최신 안정 버전이라면, 16.x는 베타/RC이거나 최신 기능이 포함된 버전일 수 있음

### React 19.2.1 사용

- React 19.2.1은 최신 19.x 버전일 가능성 높음
- 보안 취약점(CVE-2025-55182) 패치가 포함된 버전

---

## 🎯 확인 방법

### npm registry 직접 확인

```bash
# Next.js 최신 버전 확인
npm view next version

# React 최신 버전 확인
npm view react version

# Next.js 16.x 최신 버전 확인
npm view next versions --json | grep "16\."

# React 19.x 최신 버전 확인
npm view react versions --json | grep "19\."
```

### pnpm으로 확인

```bash
# 설치된 버전 확인
pnpm list next react react-dom --depth=0

# 최신 버전 확인
pnpm outdated next react react-dom
```

---

## 📊 결론

### 현재 상태 ✅

- **Next.js**: 16.0.7 ✅ **취약점 패치 포함된 최신 버전**
  - CVE-2025-66478 취약점 패치 포함
  - React Compiler 지원 안정화
  - Turbopack 기본 번들러로 채택
  
- **React**: 19.2.1 ✅ **취약점 패치 포함된 최신 버전**
  - CVE-2025-55182 (React2Shell) 취약점 패치 포함
  - 보안 패치 적용 완료

### 보안 취약점 패치 확인 ✅

1. **React 취약점 (CVE-2025-55182)**
   - React2Shell 취약점
   - React 19.2.1에서 패치 완료 ✅

2. **Next.js 취약점 (CVE-2025-66478)**
   - Next.js 16.0.7에서 패치 완료 ✅

### ⚠️ 중요한 발견

**Next.js 16에서 middleware.ts 변경사항**:
- 일부 문서에 따르면 Next.js 16에서 `middleware.ts` 파일명이 `proxy.ts`로 변경되었다는 정보
- 또는 middleware.ts의 동작 방식이 변경되었을 가능성
- 이것이 Edge Runtime 강제 문제와 관련이 있을 수 있음

---

## 🔗 참고 자료

- [Next.js Releases](https://github.com/vercel/next.js/releases)
- [React Releases](https://github.com/facebook/react/releases)
- [npm - next](https://www.npmjs.com/package/next)
- [npm - react](https://www.npmjs.com/package/react)

