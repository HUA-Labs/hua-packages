# 의존성 업데이트 계획 (2026-01-20)

## 개요
Dependabot이 제안한 패키지 업데이트를 안전도에 따라 분류하여 단계적 업데이트 진행

## Phase 1: 안전한 패치 업데이트 (먼저)

| 패키지 | From | To | 비고 |
|--------|------|-----|------|
| react | 19.2.1 | 19.2.3 | 패치 |
| react-dom | 19.2.1 | 19.2.3 | 패치 |
| @radix-ui/react-label | 2.1.7 | 2.1.8 | 패치 |
| @radix-ui/react-progress | 1.1.7 | 1.1.8 | 패치 |
| @radix-ui/react-separator | 1.1.7 | 1.1.8 | 패치 |
| @radix-ui/react-slot | 1.2.3 | 1.2.4 | 패치 |
| chart.js | 4.5.0 | 4.5.1 | 패치 |
| react-chartjs-2 | 5.3.0 | 5.3.1 | 패치 |
| yaml | 2.8.1 | 2.8.2 | 패치 |
| sharp | 0.34.4 | 0.34.5 | 패치 |
| pnpm | 10.28.0 | 10.28.1 | 패치 |

### 실행 명령어
```bash
# 루트에서 실행
pnpm update react react-dom @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-slot chart.js react-chartjs-2 yaml sharp

# pnpm 업데이트 (별도)
corepack prepare pnpm@10.28.1 --activate
```

---

## Phase 2: 마이너 업데이트 (주의해서)

| 패키지 | From | To | 비고 |
|--------|------|-----|------|
| zod | 4.1.12 | 4.3.5 | 마이너, 보통 안전 |
| pg | 8.16.3 | 8.17.1 | 마이너 |
| ioredis | 5.8.2 | 5.9.2 | 마이너 |
| react-hook-form | 7.69.0 | 7.71.1 | 마이너 |
| swagger-ui-react | 5.30.3 | 5.31.0 | 마이너 |

### 실행 명령어
```bash
pnpm update zod pg ioredis react-hook-form swagger-ui-react
```

---

## Phase 3: 주의 필요한 업데이트 (개별 테스트)

| 패키지 | From | To | 주의사항 |
|--------|------|-----|----------|
| next | 16.0.10 | 16.1.3 | breaking changes 확인, 릴리즈 노트 확인 필수 |
| @prisma/adapter-pg | 7.1.0 | 7.2.0 | @prisma/client, @prisma/client-runtime-utils 함께 업데이트 |
| @prisma/client | 7.1.0 | 7.2.0 | prisma generate 다시 실행 필요 |
| next-intl | 4.5.5 | 4.7.0 | i18n 관련 변경사항 확인 |
| recharts | 3.2.1 | 3.6.0 | 차트 API 변경 가능 |

### Prisma 업데이트 절차
```bash
# 1. 패키지 업데이트
pnpm update @prisma/client @prisma/adapter-pg prisma

# 2. client-runtime-utils도 함께
pnpm update @prisma/client-runtime-utils

# 3. prisma generate
cd apps/my-app && pnpm prisma generate

# 4. 빌드 테스트
pnpm turbo run build --filter=my-app
```

---

## Phase 4: 큰 점프 (별도 검토)

| 패키지 | From | To | 주의사항 |
|--------|------|-----|----------|
| lucide-react | 0.263.1 | 0.562.0 | **메이저급**, 아이콘 이름 변경 가능 |
| next-themes | 0.2.1 | 0.4.6 | **메이저급**, API 변경 확인 |
| @aws-sdk/client-ses | 3.891.0 | 3.971.0 | 80버전 점프, changelog 확인 |
| @supabase/supabase-js | 2.57.4 | 2.90.1 | 33버전 점프, breaking changes 확인 |

### lucide-react 업데이트 주의
- 아이콘 이름 변경 가능성 높음
- 사용 중인 아이콘 목록 확인 후 진행
```bash
# 사용 중인 lucide 아이콘 검색
grep -r "from 'lucide-react'" --include="*.tsx" --include="*.ts" apps/ packages/
```

---

## 업데이트 후 체크리스트

- [ ] `pnpm install` 성공
- [ ] `pnpm turbo run build` 전체 빌드 성공
- [ ] my-app 로컬 테스트
- [ ] hua-docs 로컬 테스트
- [ ] hua-official 로컬 테스트
- [ ] Vercel preview 배포 확인

---

## 참고: 현재 스킵하는 업데이트

| 패키지 | 이유 |
|--------|------|
| @anthropic-ai/claude-code | 개발 도구, 프로젝트와 무관 |

---

## 관련 이슈
- Dependabot PR 실패 (2026-01-19) - main 빌드 실패로 인한 것, 핫픽스 완료
