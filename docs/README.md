# HUA Platform Documentation

PARA 변형 구조로 정리됨 (2026-02-22).

## 문서 구조

```
docs/
├── projects/              # 시간 한정, 진행 중 프로젝트
│   ├── my-app-launch/    베타 체크리스트, KMS 마이그레이션
│   ├── paper/               논문 로드맵, CHI 재제출
│   └── talk-2026-02/        2/28 발표 자료
│
├── areas/                 # 끝 없는 지속 관리 영역
│   ├── architecture/        아키텍처 문서
│   ├── tech-debt/           기술 부채
│   ├── roadmap/             로드맵
│   ├── tasks/               태스크
│   ├── design/              디자인 설계
│   └── notification/        알림 정책
│
├── resources/             # 변하지 않는 레퍼런스
│   ├── patterns/            기술 패턴 & 트러블슈팅
│   ├── appendix/            용어집, 테스트 시스템 등
│   ├── packages/            패키지 설계문서 (SSOT는 .hua-agent-docs)
│   └── quick-start.md       온보딩 가이드
│
├── devlogs/               # PARA 밖, 축적 일지
│   ├── 2025-12/
│   ├── 2026-01/
│   ├── 2026-02/
│   └── TEMPLATE.md
│
├── archive/               # 완료/비활성
│   ├── devlogs/             2025-07, 2025-08
│   ├── plans/               완료된 태스크/로드맵
│   └── collab-legacy/
│
├── assets/                # 이미지/아이콘
├── private/               # gitignored
├── internal/              # pro strategy
└── CONTRIBUTING.md
```

## 빠른 링크

- [Quick Start](./resources/quick-start.md)
- [아키텍처 개요](./areas/architecture/01-overview.md)
- [API 레이어](./areas/architecture/02-api-layer.md)
- [서비스 레이어](./areas/architecture/03-service-layer.md)
- [데이터 레이어](./areas/architecture/05-data-layer.md)
- [용어집](./resources/appendix/glossary.md)
- [기여 가이드](./CONTRIBUTING.md)

## 원칙

- **Projects**: 완료되면 archive로
- **Areas**: 삭제하지 않고 계속 업데이트
- **Resources**: 변경 빈도 낮음, 레퍼런스용
- **Devlogs**: 절대 삭제 안 함, 축적 자산
- **Archive**: 검색은 가능하되 네비게이션에서 제외
