# 모노레포 정리 계획

## 🔴 즉시 정리 필요 (완료됨)

### ✅ 완료된 항목들
- [x] Git 저장소 초기화
- [x] 루트 .gitignore 통합
- [x] 환경 변수 예시 파일 생성
- [x] 공통 ESLint 설정 생성
- [x] 루트 README 업데이트
- [x] Node.js 버전 통일 (.nvmrc)
- [x] Next.js 버전 통일 (15.4.1)
- [x] React 버전 통일 (19.1.0)
- [x] TypeScript 버전 통일 (5.8.3)
- [x] 의존성 경로 문제 해결
- [x] Node.js 타입 정의 추가
- [x] 중첩된 .git 폴더 제거
- [x] GitHub 원격 저장소 연결
- [x] 타입 체크 통과 (모든 패키지)
- [x] SDK 패키지 의존성 문제 해결 (임시 비활성화)

## 🟡 다음 단계 정리 필요

### 1. 중복된 .gitignore 파일들 정리
```
현재 상황:
- 루트 .gitignore ✅ (통합됨)
- apps/my-api/.gitignore (삭제 예정)
- apps/my-chat/.gitignore (삭제 예정)
- apps/my-app/.gitignore (삭제 예정)
- packages/hua-i18n-sdk/.gitignore (삭제 예정)
- packages/hua-my-api-sdk/.gitignore (삭제 예정)
- apps/hua-labs-official/.gitignore (삭제 예정)
- apps/hua-demo/.gitignore (삭제 예정)

정리 방법:
- 각 앱/패키지의 .gitignore 파일 삭제
- 루트 .gitignore로 통합 관리
```

### 2. 문서 폴더 구조 정리 ✅
```
문서 폴더 전략:
📁 docs/
├── 📖 public/          # 공개 문서 (Git에 포함) ✅
│   ├── api/           # API 문서 ✅
│   ├── guides/        # 개발 가이드 ✅
│   ├── architecture/  # 아키텍처 문서 ✅
│   └── user-manuals/  # 사용자 매뉴얼 ✅
├── 🔒 private/        # 비공개 문서 (Git에서 제외) ✅
│   ├── meetings/      # 회의록 ✅
│   ├── internal/      # 내부 문서 ✅
│   └── security/      # 보안 관련 ✅
└── 📋 templates/      # 문서 템플릿 ✅

.gitignore 설정: ✅
- docs/private/        # 비공개 문서 제외
- docs/**/*.key        # 키 파일 제외
- docs/**/*.secret     # 비밀 파일 제외

문서 이동: ✅
- MONOREPO_CLEANUP_PLAN.md → docs/public/architecture/monorepo-cleanup-plan.md
```

### 3. 중복된 README 파일들 정리
```
현재 상황:
- 루트 README.md ✅ (업데이트됨)
- apps/my-api/README.md ✅ (간소화 완료)
- apps/my-chat/README.md ✅ (간소화 완료)
- apps/my-app/README.md ✅ (간소화 완료)
- packages/hua-i18n-sdk/README.md (유지)
- apps/hua-labs-official/README.md (간소화 필요)

정리 방법:
- 각 앱의 README는 해당 앱의 특별한 설정만 포함
- 공통 정보는 루트 README 참조
```

### 4. 중복된 ESLint 설정 정리
```
현재 상황:
- 루트 eslint.config.mjs ✅ (생성됨)
- apps/my-api/eslint.config.mjs (삭제 예정)
- apps/my-chat/eslint.config.mjs (삭제 예정)
- apps/my-app/eslint.config.mjs (삭제 예정)
- apps/hua-labs-official/eslint.config.mjs (삭제 예정)

정리 방법:
- 각 앱의 eslint.config.mjs 삭제
- 루트 설정으로 통합 관리
```

### 4. 환경 변수 파일 정리
```
현재 상황:
- 루트 .env.example ✅ (생성됨)
- infra/ 폴더 ✅ (생성됨)
- 각 앱별 .env 파일들 (infra/ 폴더로 이동 예정)

정리 방법:
- apps/my-api/.env → infra/my-api/.env
- apps/my-chat/.env → infra/my-chat/.env
- apps/my-app/.env → infra/my-app/.env
- 공통 환경 변수는 루트 .env
```

### 5. 중복된 설정 파일들 정리
```
현재 상황:
- 각 앱별 package.json (유지)
- 각 패키지별 package.json (유지)
- 중복된 tsconfig.json 파일들 (확인 필요)

정리 방법:
- 각 앱/패키지는 자체 tsconfig.json 유지
- 루트 tsconfig.base.json 참조
```

## 🟢 장기적 정리 계획

### 1. 문서 통합
```
- 각 앱의 문서를 docs/ 폴더로 통합
- API 문서 통합
- 개발 가이드 통합
```

### 2. 테스트 통합
```
- 공통 테스트 설정
- 테스트 커버리지 통합
- E2E 테스트 설정
```

### 3. CI/CD 통합
```
- GitHub Actions 워크플로우 통합
- 배포 파이프라인 통합
- 환경별 배포 설정
```

### 4. 개발 도구 통합
```
- 공통 스크립트
- 개발 환경 설정
- 디버깅 도구
```

## 📋 정리 우선순위

### 높음 (즉시)
1. 중복 .gitignore 파일 삭제
2. 중복 ESLint 설정 삭제
3. 환경 변수 파일 이동

### 중간 (이번 주)
1. README 파일 간소화
2. 설정 파일 정리
3. 문서 구조 개선

### 낮음 (다음 주)
1. 테스트 통합
2. CI/CD 설정
3. 개발 도구 통합

## 🎯 완료 기준

- [ ] 모든 중복 파일 제거
- [ ] 공통 설정으로 통합
- [ ] 문서 일관성 확보
- [ ] 개발 환경 표준화
- [ ] 배포 파이프라인 통합 