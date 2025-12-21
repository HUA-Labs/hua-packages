# React Patterns & Solutions

이 폴더는 프로젝트 개발 중 마주한 실전 문제와 해결 방법을 문서화합니다.

## 📚 문서 목록

### 1. [순환 의존성 해결 (Circular Dependency)](./circular-dependency-hooks.md)
React 훅 간의 순환 의존성 문제와 `useRef`를 활용한 해결 방법

### 2. [Next.js 빌드 타임 모듈 실행 문제 해결](./build-time-module-execution.md)
Next.js 빌드 시점에 모듈이 실행되면서 환경 변수가 없어 오류 발생 문제와 Lazy Initialization 패턴을 활용한 해결 방법

### 3. [Vercel에서 pnpm 버전 지정하기](./vercel-pnpm-version.md)
Vercel 빌드 시 pnpm 버전 불일치 오류와 corepack을 사용한 해결 방법

### 4. [Vercel에서 tsc 빌드 오류 해결하기](./vercel-tsc-build-error.md)
Vercel 빌드 시 "No such file or directory" 오류와 `pnpm exec tsc`를 사용한 해결 방법

### 5. [Vercel에서 빌드 도구 실행 오류 해결하기](./vercel-build-tool-execution-error.md)
Vercel 빌드 시 tsup, tsc 등 빌드 도구 실행 오류의 원인 분석과 해결 방법

### 6. [Lazy Cleanup 패턴 분석](./LAZY_CLEANUP_PATTERN_ANALYSIS.md)
서버리스 환경에서 메모리 누수 방지를 위한 Lazy Cleanup 패턴 분석 및 최적화

### 7. [Vercel + Turbo PATH 문제 해결 패턴](./vercel-turbo-path-issue.md) ⭐
Vercel 환경에서 Turbo가 PATH를 상속받지 못하는 문제 해결 방법 및 pnpm filter 전략

---

## 🎯 목적

1. **지식 공유**: 팀원들과 미래의 자신을 위한 참고 자료
2. **문제 해결 가속화**: 유사한 문제 발생 시 빠른 해결
3. **베스트 프랙티스**: 검증된 해결 방법 축적
4. **오픈소스 기여**: 다른 개발자들에게도 도움

## 📝 문서 작성 가이드

각 문서는 다음 구조를 따릅니다:

```markdown
# 제목

## 문제 상황
- 어떤 문제가 발생했는가?
- 왜 발생했는가?

## 해결 방법
- 어떻게 해결했는가?
- 코드 예시

## 배운 점
- 핵심 교훈
- 주의사항

## 참고 자료
- 관련 링크
```

---

**Last Updated**: 2025-12-07

