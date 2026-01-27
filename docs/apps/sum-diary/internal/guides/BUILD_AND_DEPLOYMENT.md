# 빌드 및 배포 가이드

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16

## 개요

이 문서는 숨다이어리 서비스의 빌드 및 배포 관련 통합 가이드입니다.

---

## 1. 빌드 설정

### 1.1 빌드 도구

**현재 사용:**
- Turbopack (개발 환경)
- Webpack (프로덕션 빌드)

**설정 파일:**
- `next.config.ts`: Next.js 설정
- `turbo.json`: Turbopack 설정
- `tsconfig.json`: TypeScript 설정

### 1.2 빌드 명령어

```bash
# 개발 서버 (Turbopack)
pnpm dev

# 프로덕션 빌드 (Webpack)
pnpm build

# 프로덕션 서버 시작
pnpm start
```

### 1.3 빌드 문제 해결

**Turbopack vs Webpack 이슈:**
- 개발 환경: Turbopack 사용
- 프로덕션 빌드: Webpack 사용
- 일부 설정이 다를 수 있음

자세한 내용은:
- [Turbopack vs Webpack 빌드 이슈](./TURBOPACK_VS_WEBPACK_BUILD_ISSUES.md)
- [Turbo 경로 수정](./TURBO_PATH_FIX.md)
- [빌드 수정 시도](./BUILD_FIX_ATTEMPTS_2025-12-15.md)

---

## 2. Prisma 빌드 설정

### 2.1 Prisma 빌드 환경 변수

Prisma 빌드 시 필요한 환경 변수:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 2.2 Prisma Client 초기화

**싱글톤 패턴 사용:**
- 모든 파일에서 동일한 PrismaClient 인스턴스 사용
- 빌드 시 초기화 문제 방지

자세한 내용은:
- [Prisma 빌드 환경 변수](./PRISMA_BUILD_ENV_VARIABLES.md)
- [Prisma Lazy 초기화 분석](./PRISMA_LAZY_INITIALIZATION_ANALYSIS.md)

---

## 3. Vercel 배포

### 3.1 Vercel 설정

**vercel.json:**
```json
{
  "framework": "nextjs",
  "installCommand": "corepack enable && corepack prepare pnpm@10.24.0 --activate && cd ../.. && corepack pnpm install --frozen-lockfile --ignore-scripts=false",
  "buildCommand": "cd ../.. && corepack pnpm exec turbo run build --filter=my-app",
  "devCommand": "cd ../.. && pnpm --filter my-app run dev"
}
```

### 3.2 환경 변수 설정

Vercel 대시보드에서 환경 변수 설정:
- Production
- Preview
- Development

**필수 환경 변수:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

### 3.3 서버리스 환경 최적화

**메모리 누수 방지:**
- 메모리 캐시 TTL 설정
- 연결 풀 최적화
- PrismaClient 싱글톤 사용

자세한 내용은 [Vercel 서버리스 누수 수정](./VERCEL_SERVERLESS_LEAK_FIXES.md) 참조

---

## 4. 프라이빗 데이터베이스 배포

### 4.1 프라이빗 DB 설정

프라이빗 데이터베이스를 사용한 배포 가이드:
- VPC 설정
- 네트워크 보안 그룹 설정
- 연결 문자열 설정

자세한 내용은 [프라이빗 DB 배포](./DEPLOYMENT_WITH_PRIVATE_DB.md) 참조

---

## 5. 배포 체크리스트

### 사전 배포
- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 빌드 테스트 완료
- [ ] 프로덕션 빌드 성공 확인

### 배포 후
- [ ] 애플리케이션 정상 작동 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 테스트
- [ ] 모니터링 설정 확인

---

## 참고 문서

이 문서는 다음 문서들을 통합한 것입니다:
- 빌드 수정 시도 (archive)
- Turbopack vs Webpack 빌드 이슈 (archive)
- Turbo 경로 수정 (archive)
- 프라이빗 DB 배포 (archive)
- Vercel 서버리스 누수 수정 (archive)

상세 내용은 `guides/archive/` 폴더를 참조하세요.

### 유지되는 문서
- [Prisma 빌드 환경 변수](./PRISMA_BUILD_ENV_VARIABLES.md) - Prisma 빌드 시 필수 참조
- [Prisma Lazy 초기화 분석](./PRISMA_LAZY_INITIALIZATION_ANALYSIS.md) - Prisma 최적화 참조
- [프로덕션 준비 체크리스트](./PRODUCTION_READINESS_CHECKLIST.md) - 배포 전 필수 체크리스트

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
