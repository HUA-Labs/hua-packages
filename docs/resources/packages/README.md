# HUA Platform 패키지 문서

> 모노레포 패키지 문서 인덱스

## 패키지 구조

```
@hua-labs/
├── hua              # 메인 프레임워크 (ui + motion + i18n 통합)
├── ui                  # 100+ React 컴포넌트
├── motion-core         # 28개 애니메이션 훅
├── i18n-core           # Zero-flicker i18n
├── i18n-core-zustand   # Zustand 어댑터
├── i18n-formatters     # 날짜/숫자/통화 포맷터
├── i18n-loaders        # 번역 로더
├── state               # Zustand 기반 상태관리
├── pro                 # 프리미엄 기능
├── encryption          # GCP KMS 암호화
├── docs-engine         # 문서 컴포넌트
└── create-hua       # CLI 스캐폴딩
```

## 문서 폴더

| 폴더 | 패키지 | 설명 |
|------|--------|------|
| [i18n/](./i18n/) | i18n-core, formatters, loaders | 다국어 시스템 |
| [motion/](./motion/) | motion-core | 애니메이션 훅 |
| [ui/](./ui/) | ui | UI 컴포넌트 |

## 빠른 시작

### 프레임워크 사용 (권장)
```bash
npx create-hua my-app
```

### 개별 패키지 사용
```bash
pnpm add @hua-labs/ui @hua-labs/motion-core @hua-labs/i18n-core
```

## 패키지별 README

각 패키지의 `README.md`는 해당 패키지 폴더에 있습니다:
- `packages/hua/README.md`
- `packages/hua-ui/README.md`
- `packages/hua-motion-core/README.md`
- 등

---

*마지막 업데이트: 2026-02-06*
