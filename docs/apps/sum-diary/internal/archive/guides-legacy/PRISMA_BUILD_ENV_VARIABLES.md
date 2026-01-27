# Prisma 빌드 시 환경 변수 로드 가이드

## 📅 날짜
2025-12-15

## 🎯 목적
Prisma 7.1.0 + Next.js 빌드 시 환경 변수 로드 문제 해결

## 🔍 현재 환경 변수 관리 방식

### 로컬 개발 환경
- **도구**: Doppler
- **사용법**: `doppler run -- <command>`
- **예시**: `"dev": "doppler run -- next dev --webpack"`

### Vercel 배포 환경
- **도구**: Vercel Secrets (환경 변수)
- **설정 위치**: Vercel 대시보드 > Settings > Environment Variables
- **자동 주입**: Vercel이 빌드/런타임에 자동으로 환경 변수 주입

## ⚠️ 빌드 시 환경 변수 로드 문제

### 문제 상황
PrismaClient가 빌드 시 초기화되면서 `DATABASE_URL`을 찾지 못해 오류 발생

### 원인 분석
1. **TurboRepo 환경 변수 전달**: `turbo.json`의 `globalEnv`와 `tasks.build.env` 설정
2. **Next.js 빌드 프로세스**: 빌드 시 정적 페이지 생성 과정에서 PrismaClient 초기화
3. **환경 변수 로드 타이밍**: 빌드 타임과 런타임 환경 변수 로드 시점 차이

## ✅ 해결 방법

### 1. turbo.json 설정 확인

현재 설정:
```json
{
  "globalEnv": ["DATABASE_URL", "NODE_ENV", "DIRECT_URL"],
  "tasks": {
    "build": {
      "env": [
        "NODE_ENV",
        "DATABASE_URL",
        "DIRECT_URL",
        // ... 기타 환경 변수
      ]
    }
  }
}
```

**확인 사항**:
- ✅ `globalEnv`에 `DATABASE_URL` 포함
- ✅ `tasks.build.env`에 `DATABASE_URL` 포함

### 2. Vercel 환경 변수 설정 확인

**필수 확인 사항**:
1. Vercel 대시보드 > Settings > Environment Variables
2. `DATABASE_URL`이 다음 환경에 모두 설정되어 있는지 확인:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**설정 방법**:
1. Vercel 프로젝트 대시보드 접속
2. Settings > Environment Variables
3. `DATABASE_URL` 확인/추가
4. 환경 선택: Production, Preview, Development 모두 선택

### 3. vercel.json 설정 (선택사항)

현재 `vercel.json`에는 환경 변수 설정이 없습니다. Vercel은 자동으로 환경 변수를 주입하므로 일반적으로 추가 설정이 필요 없습니다.

**필요시 명시적 설정**:
```json
{
  "build": {
    "env": {
      "DATABASE_URL": "@database-url",
      "DIRECT_URL": "@direct-url"
    }
  }
}
```

⚠️ **주의**: Vercel Secrets를 사용하는 경우 `@secret-name` 형식으로 참조해야 합니다.

### 4. 로컬 빌드 테스트

로컬에서 빌드 테스트 시:
```bash
# Doppler 사용
doppler run -- pnpm build

# 또는 환경 변수 직접 설정
DATABASE_URL="postgresql://..." pnpm build
```

## 🔧 PrismaClient Lazy Initialization

현재 `apps/my-app/app/lib/prisma.ts`는 Lazy Initialization 패턴을 사용합니다:

```typescript
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL 
    ? optimizeDatabaseUrl(process.env.DATABASE_URL)
    : 'postgresql://localhost:5432/dummy?connection_limit=1'
  
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter, log: [...] })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()
```

**핵심**: 빌드 시 `DATABASE_URL`이 없어도 더미 URL로 초기화하여 빌드 실패 방지

## 📋 체크리스트

### Vercel 환경 변수 확인
- [ ] `DATABASE_URL`이 Production 환경에 설정됨
- [ ] `DATABASE_URL`이 Preview 환경에 설정됨
- [ ] `DATABASE_URL`이 Development 환경에 설정됨
- [ ] `DIRECT_URL`이 필요한 경우 설정됨

### turbo.json 설정 확인
- [ ] `globalEnv`에 `DATABASE_URL` 포함
- [ ] `tasks.build.env`에 `DATABASE_URL` 포함

### 코드 확인
- [ ] `prisma.ts`에서 Lazy Initialization 패턴 적용
- [ ] `next.config.ts`에 `serverComponentsExternalPackages` 설정
- [ ] 빌드 시 더미 URL로 fallback 처리

## 🐛 문제 해결

### 빌드 시 "DATABASE_URL is not set" 오류

**원인**: Vercel 환경 변수가 빌드 시 전달되지 않음

**해결**:
1. Vercel 대시보드에서 환경 변수 설정 확인
2. `turbo.json`의 `globalEnv` 확인
3. 빌드 로그에서 환경 변수 전달 여부 확인

### 빌드 시 PrismaClient 초기화 오류

**원인**: PrismaClient가 빌드 타임에 실제 DB 연결 시도

**해결**:
1. Lazy Initialization 패턴 확인
2. `next.config.ts`의 `serverComponentsExternalPackages` 확인
3. 더미 URL fallback 확인

## 📚 참고 자료

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [TurboRepo Environment Variables](https://turbo.build/repo/docs/reference/configuration#env)
- [Prisma 7.1.0 Migration Guide](https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
