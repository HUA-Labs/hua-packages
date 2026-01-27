# 문서 정리 넥스트 플랜

> 작성일: 2026-01-27
> 브랜치: `chore/docs-cleanup-centralization`
> 상태: **완료**

## 개요

모노레포 문서 구조를 중앙집중화하고 중복/오래된 문서 정리.

---

## 완료된 작업

### 사전 작업

#### 1. devlog 폴더 구조 개선
- [x] `docs/devlogs/2025-12/` 폴더 생성 및 이동 (70+ 파일)
- [x] `docs/devlogs/2026-01/` 폴더 생성 및 이동 (75+ 파일)
- [x] `apps/my-app/docs/devlog/` → `docs/devlogs/2026-01/`로 이동

#### 2. my-app guides 중복 파일 삭제
- [x] `apps/my-app/docs/guides/`에서 archive와 중복된 파일 삭제

---

### Phase 1: my-app 문서 중앙집중화 ✅

#### 1.1 apps/my-app/docs/ → docs/apps/my-app/ 통합
- [x] architecture/ 이동
- [x] database/ 이동
- [x] guides/ 이동 (중복 파일 병합)
- [x] planning/ 이동 (중복 파일 병합)
- [x] security/ 이동 (중복 파일 병합)
- [x] history/ 이동
- [x] analysis/ 이동
- [x] archive/ 이동
- [x] 단일 파일들 이동 (ARCHITECTURE_AND_FEATURES.md, PROJECT_INTRODUCTION.md 등)
- [x] `apps/my-app/docs/README.md` 간소화 (중앙 문서 링크만)

#### 1.2 docs/apps/my-app/internal/ 정리
- [x] 중첩 폴더 해제 (guides/guides, security/security, planning/planning 등)
- [x] 루트 파일 분류 및 이동
  - 아키텍처 문서 → architecture/
  - 분석 문서 → analysis/
  - 리팩토링 문서 → history/
  - 계획 문서 → planning/
  - 기술 문서 → guides/
- [x] documentation/ → archive/ 통합
- [x] beta/, cost-management/ → planning/ 하위로 이동

---

### Phase 2: 오래된 문서 archive ✅

#### 2.1 archive 구조 통합
- [x] guides/archive → archive/guides-legacy
- [x] planning/archive → archive/planning-legacy
- [x] patterns 트러블슈팅 문서 → archive/troubleshooting

---

### Phase 3: 루트 docs 정리 ✅

#### 3.1 루트 파일 카테고리화
- [x] HUA 관련 → packages/hua-ux/planning/
- [x] GT/Graphite 관련 → archive/graphite/
- [x] PR 관련 → archive/pr/
- [x] 가이드 문서 → guides/
- [x] devlog 파일 → devlogs/2025-12/
- [x] 기술/계획 문서 → planning/
- [x] Animation 문서 → packages/motion/
- [x] I18N 문서 → packages/i18n/
- [x] plans/ 폴더 → planning/ 통합

---

## 최종 결과

### docs/ 구조
```
docs/
├── apps/                    # 앱별 문서
│   └── my-app/
│       ├── README.md
│       ├── abuse-prevention.md
│       ├── limit-system.md
│       ├── privacy.md
│       └── internal/        # 내부 문서 (정리 완료)
├── packages/                # 패키지별 문서
│   ├── hua-ux/
│   ├── i18n/
│   ├── motion/
│   └── ui/
├── devlogs/                 # 개발 로그
│   ├── 2025-12/
│   └── 2026-01/
├── guides/                  # 공통 가이드
├── planning/                # 계획 문서
├── archive/                 # 아카이브
├── graphite/                # Graphite 가이드
├── code-review/             # 코드 리뷰 체크리스트
├── security/                # 보안 문서
├── patterns/                # 공통 패턴
├── templates/               # 템플릿
├── CONTRIBUTING.md
└── README.md
```

### apps/my-app/docs/ 구조
```
apps/my-app/docs/
├── README.md                # 중앙 문서 링크 안내
└── database-dumps/          # DB 스키마 덤프 (로컬 유지)
```

---

## devlog 명명 규칙 (새 파일용)

**형식:** `{날짜}-{프로젝트}-{주제}.md`
- 소문자, 대시(-) 구분
- 예: `2026-01-27-my-app-multilang-prompt-test.md`

**프로젝트 약어:**
- `my-app` - 숨다이어리
- `hua-ux` - HUA UX 프레임워크
- `hua-ui` - HUA UI 패키지
- `hua-docs` - HUA 문서 사이트
- `hua-official` - HUA 공식 사이트
- `monorepo` - 모노레포 공통

---

## 커밋 가이드

```bash
git add -A
git commit -m "chore(docs): centralize and cleanup documentation structure"
```

---

**완료일**: 2026-01-27
