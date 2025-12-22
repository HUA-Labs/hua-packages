# Turbopack vs Webpack 빌드 이슈 분석

## 📅 날짜
2025-12-15

## 🎯 목적
Turbopack과 Webpack 빌드 차이점 분석 및 Prisma 빌드 오류 원인 파악

## 🔍 관찰된 현상

### i18n-test 앱
- **문제**: Turbopack 빌드 시 Google Fonts 모듈을 찾을 수 없음
- **오류**: `Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`
- **해결**: `--webpack` 플래그 추가 → 빌드 성공 ✅

### my-app 앱
- **현재 설정**: `"build": "prisma generate --schema=./prisma/schema.prisma && next build --webpack"`
- **상태**: 이미 `--webpack` 플래그 사용 중
- **문제**: PrismaClient 빌드 시 초기화 오류 여전히 발생

## 📊 분석

### Turbopack의 알려진 문제점

1. **모듈 해석 차이**
   - Turbopack은 webpack과 다른 모듈 해석 알고리즘 사용
   - 일부 패키지(특히 네이티브 모듈, adapter 등)에서 문제 발생 가능

2. **환경 변수 처리**
   - Turbopack이 빌드 시 환경 변수를 다르게 처리할 수 있음
   - PrismaClient 초기화 시점에 환경 변수 접근 문제 가능

3. **서버 컴포넌트 번들링**
   - Turbopack이 서버 컴포넌트를 더 공격적으로 번들링할 수 있음
   - `serverComponentsExternalPackages` 설정이 제대로 작동하지 않을 수 있음

### my-app 앱 현재 상태

**빌드 스크립트**:
```json
{
  "build": "prisma generate --schema=./prisma/schema.prisma && next build --webpack"
}
```

**확인 사항**:
- ✅ 이미 `--webpack` 플래그 사용 중
- ✅ `next.config.ts`에 `serverComponentsExternalPackages` 설정됨
- ✅ Lazy Initialization 패턴 적용됨

**문제 가능성**:
1. **Vercel 빌드 시 기본값**: Vercel이 기본적으로 Turbopack을 사용할 수 있음
2. **환경 변수 로드 타이밍**: webpack 사용 시에도 환경 변수 로드 타이밍 문제 가능
3. **PrismaClient 초기화**: Turbopack과 무관한 다른 원인일 수 있음

## ✅ 해결 방안

### 1. 명시적 Webpack 사용 확인

**package.json**:
```json
{
  "scripts": {
    "build": "prisma generate --schema=./prisma/schema.prisma && next build --webpack"
  }
}
```

**확인**: 이미 설정되어 있음 ✅

### 2. next.config.ts에서 Turbopack 비활성화

**현재 설정**:
```typescript
const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'prisma',
      '@prisma/adapter-pg',
      'pg',
    ],
  },
}
```

**추가 고려사항**:
- `experimental.turbopack` 설정이 없으면 기본값 사용
- 명시적으로 비활성화할 필요는 없음 (빌드 스크립트에서 `--webpack` 사용)

### 3. Vercel 빌드 설정 확인

**vercel.json**:
```json
{
  "buildCommand": "cd ../.. && pnpm --filter=my-app... run build"
}
```

**확인**: `package.json`의 `build` 스크립트가 실행되므로 `--webpack` 플래그가 적용됨 ✅

## 🔍 추가 조사 필요

### 1. 빌드 로그 확인
- Vercel 빌드 로그에서 실제로 webpack이 사용되는지 확인
- Turbopack 관련 메시지가 있는지 확인

### 2. 로컬 빌드 테스트
```bash
# Webpack 명시적 사용
pnpm build

# 또는 직접 실행
next build --webpack
```

### 3. 환경 변수 로드 확인
- 빌드 시 `process.env.DATABASE_URL`이 실제로 로드되는지 확인
- 빌드 로그에 환경 변수 관련 메시지 확인

## 💡 결론

### 현재 상황
- `my-app`는 이미 `--webpack` 플래그를 사용하고 있음
- 하지만 PrismaClient 빌드 오류가 여전히 발생

### 가능한 원인
1. **환경 변수 로드 문제**: Turbopack과 무관, Vercel 환경 변수 설정 문제
2. **PrismaClient 초기화 타이밍**: Lazy Initialization이 완벽하지 않을 수 있음
3. **Next.js 빌드 프로세스**: 정적 페이지 생성 과정에서 PrismaClient 초기화 시도

### 권장 조치
1. ✅ Webpack 사용 확인 (이미 설정됨)
2. ⚠️ Vercel 환경 변수 설정 확인 필요
3. ⚠️ 빌드 로그에서 실제 빌드 도구 확인 필요
4. ⚠️ PrismaClient 초기화 시점 재검토 필요

## 📚 참고 자료

- [Next.js Turbopack vs Webpack](https://nextjs.org/docs/app/api-reference/next-cli#turbopack)
- [Turbopack Known Issues](https://turbo.build/pack/docs)
- [Prisma with Next.js](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
