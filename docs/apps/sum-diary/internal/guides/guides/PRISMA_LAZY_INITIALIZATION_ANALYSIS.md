# Prisma Lazy Initialization 패턴 분석 및 개선 제안

## 📅 날짜
2025-12-15

## 🔍 현재 코드 분석

### 현재 구현 상태
현재 `apps/my-app/app/lib/prisma.ts`는 이미 **Lazy Initialization 패턴**을 적용하고 있습니다:

```typescript
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL 
    ? optimizeDatabaseUrl(process.env.DATABASE_URL)
    : 'postgresql://localhost:5432/dummy?connection_limit=1'
  
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter, log: [...] })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()
export { prisma }
```

### 제안된 코드와의 비교

#### ✅ 이미 적용된 부분
1. **Lazy Initialization 패턴**: `prismaClientSingleton` 함수 내부에서 초기화
2. **globalThis 캐싱**: HMR 대응을 위한 전역 캐싱
3. **함수 호출 방식**: `globalThis.prisma ?? prismaClientSingleton()` 사용

#### 🔄 차이점 및 개선 가능한 부분

**1. Export 방식**
- **제안**: `export default prisma`
- **현재**: `export { prisma }` (named export)
- **분석**: 
  - 현재 코드베이스에서 75개 파일이 `import { prisma } from '@/app/lib/prisma'` 형태로 사용 중
  - Named export가 더 명시적이고 TypeScript에서 자동완성이 잘 작동함
  - **결론**: 현재 방식 유지 권장 ✅

**2. Connection String 처리**
- **제안**: `const connectionString = process.env.DATABASE_URL;` (단순)
- **현재**: `optimizeDatabaseUrl()` 함수로 연결 풀 파라미터 추가
- **분석**:
  - 현재 방식은 레일웨이 DB 등 원격 DB의 연결 지연을 최적화
  - 연결 풀 파라미터(`connection_limit`, `pool_timeout`, `connect_timeout`) 자동 추가
  - **결론**: 현재 방식이 더 나음 ✅ (프로덕션 환경 최적화)

**3. Log 설정**
- **제안**: `log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']`
- **현재**: `log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn']`
- **분석**:
  - 제안은 개발 시 `query` 로그 포함 (디버깅에 유용하지만 성능 영향)
  - 현재는 `query` 로그 제외 (성능 우선)
  - **결론**: 필요시 개발 환경에서만 `query` 로그 활성화 가능

## 💡 개선 제안

### 1. 코드 구조는 유지, 세부 최적화만 적용

현재 코드 구조는 이미 잘 되어 있습니다. 다만 다음 개선을 고려할 수 있습니다:

```typescript
// 개선안: 더 명확한 주석과 타입 안정성
const prismaClientSingleton = (): PrismaClient => {
  // 빌드 시에는 더미 URL 사용 (실제 연결은 런타임에)
  const connectionString = process.env.DATABASE_URL 
    ? optimizeDatabaseUrl(process.env.DATABASE_URL)
    : 'postgresql://localhost:5432/dummy?connection_limit=1'
  
  const adapter = new PrismaPg({ connectionString })
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' 
      ? ['error'] 
      : ['error', 'warn'], // 필요시 ['query', 'error', 'warn']로 변경 가능
  })
}
```

### 2. next.config.ts 확인

현재 설정:
```typescript
experimental: {
  serverComponentsExternalPackages: [
    '@prisma/client',
    'prisma',
    '@prisma/adapter-pg',
    'pg',
  ],
}
```

**분석**: ✅ 이미 적절히 설정되어 있음
- Prisma 관련 패키지 모두 포함
- 우리는 Neon이 아닌 PostgreSQL을 사용하므로 `@prisma/adapter-pg`, `pg`가 맞음

### 3. 빌드 시 오류 원인 재분석

현재 빌드 오류가 여전히 발생하는 이유:

1. **가능성 1**: Next.js가 빌드 시 정적 페이지 생성 과정에서 PrismaClient를 실제로 호출
   - **해결책**: `prismaClientSingleton()` 호출을 더 지연시킬 수 있는 방법 검토
   - **현재 상태**: 이미 함수 내부에서 초기화하므로 이론적으로는 해결되어야 함

2. **가능성 2**: 특정 경로(`/api/admin/crisis-alerts/[id]`)에서 빌드 타임에 코드 실행
   - **해결책**: 해당 경로의 코드에서 PrismaClient 사용 방식을 확인
   - **현재 상태**: Route Handler이므로 런타임에만 실행되어야 함

3. **가능성 3**: 환경 변수 로드 타이밍 문제
   - **해결책**: `turbo.json`의 `globalEnv` 설정 확인 (이미 추가됨)
   - **현재 상태**: 설정 완료

## 🎯 최종 권장사항

### 현재 코드 유지 + 추가 검증

1. **코드 구조**: 현재 Lazy Initialization 패턴 유지 ✅
2. **Export 방식**: Named export 유지 (기존 코드와 일관성) ✅
3. **Connection String**: `optimizeDatabaseUrl` 유지 (프로덕션 최적화) ✅
4. **next.config.ts**: 현재 설정 유지 ✅

### 추가 조사 필요

1. **빌드 로그 상세 분석**: `/api/admin/crisis-alerts/[id]` 경로에서 발생하는 정확한 오류 확인
2. **환경 변수 로드 확인**: 빌드 시 `process.env.DATABASE_URL`이 실제로 전달되는지 확인
3. **PrismaClient 초기화 시점**: 빌드 로그에서 정확히 어느 시점에 초기화가 시도되는지 확인

### 대안적 해결책 (필요시)

만약 현재 방식으로도 해결되지 않는다면:

1. **더미 연결 허용**: PrismaClient가 빌드 시 더미 URL로 연결을 시도해도 실패하지 않도록 설정
2. **Prisma Accelerate 사용**: Prisma Accelerate를 사용하면 빌드 시 실제 DB 연결이 필요 없음
3. **빌드 스크립트 수정**: 빌드 전에 환경 변수를 명시적으로 로드

## 📊 비교 요약

| 항목 | 제안된 코드 | 현재 코드 | 권장 |
|------|------------|----------|------|
| Lazy Init | ✅ | ✅ | 현재 유지 |
| Export | default | named | named 유지 |
| Connection | 단순 | 최적화 | 최적화 유지 |
| Log | query 포함 | query 제외 | 필요시 추가 |
| Config | Neon 기준 | PG 기준 | 현재 유지 |

## 🔍 결론

**현재 코드는 이미 제안된 해결책의 핵심(Lazy Initialization)을 잘 구현하고 있습니다.**

다만 빌드 오류가 여전히 발생한다면:
1. 코드 구조 문제가 아닐 가능성이 높음
2. 환경 변수 로드 타이밍 또는 Next.js 빌드 프로세스의 특정 동작 때문일 수 있음
3. 더 상세한 빌드 로그 분석이 필요함

**다음 단계**: 빌드 로그에서 정확한 오류 메시지와 스택 트레이스를 확인하여 근본 원인 파악
