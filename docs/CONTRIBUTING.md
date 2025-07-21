# Contributing to HUA Platform

## 커밋 컨벤션 (Commit Convention)

### Conventional Commits 형식 사용

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 타입 (Types)

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가 또는 수정
- **chore**: 빌드 프로세스 또는 보조 도구 변경

### 스코프 (Scope)

- **i18n**: 국제화 관련
- **api**: API 관련
- **ui**: 사용자 인터페이스
- **auth**: 인증 관련
- **db**: 데이터베이스 관련
- **config**: 설정 관련

### 예시

```bash
# 새로운 기능
git commit -m "feat(i18n): add Korean language support"

# 버그 수정
git commit -m "fix(api): resolve authentication token issue"

# 문서 수정
git commit -m "docs: update API documentation"

# 리팩토링
git commit -m "refactor(ui): simplify component structure"

# 설정 변경
git commit -m "chore(config): update TypeScript configuration"
```

### 커밋 메시지 규칙

1. **첫 글자는 소문자로**
2. **마침표로 끝내지 않음**
3. **명령형 사용** (add, fix, update, remove 등)
4. **50자 이내로 간결하게**
5. **한국어와 영어 혼용 가능**

## 개발 가이드라인

### 브랜치 전략

- **main**: 프로덕션 배포용
- **develop**: 개발 통합용
- **feature/**: 새로운 기능 개발
- **fix/**: 버그 수정
- **hotfix/**: 긴급 수정

### PR (Pull Request) 규칙

1. **제목**: 커밋 컨벤션과 동일한 형식
2. **설명**: 변경 사항 상세 설명
3. **체크리스트**: 완료된 작업 항목
4. **리뷰**: 최소 1명의 리뷰어 승인 필요

### 코드 스타일

- **TypeScript**: 엄격한 타입 체크 사용
- **ESLint**: 코드 품질 규칙 준수
- **Prettier**: 일관된 코드 포맷팅
- **한국어 주석**: 복잡한 로직에 한국어 주석 추가

## 이슈 보고

### 버그 리포트

```
**버그 설명**
간결하고 명확한 버그 설명

**재현 단계**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**예상 동작**
예상했던 정상적인 동작

**스크린샷**
가능한 경우 스크린샷 첨부

**환경 정보**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

### 기능 요청

```
**요청 배경**
이 기능이 필요한 이유

**제안 사항**
구체적인 기능 제안

**대안**
고려한 다른 해결 방법

**추가 정보**
관련 스크린샷, 링크 등
```

## 개발 환경 설정

### 필수 요구사항

- Node.js 22.17.1+
- pnpm 9.0.0+
- Git 2.40.0+

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/hua-platform.git
cd hua-platform

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 타입 체크
pnpm type-check

# 빌드
pnpm build
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 