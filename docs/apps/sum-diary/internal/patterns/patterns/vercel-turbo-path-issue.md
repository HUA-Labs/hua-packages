# Vercel + Turbo PATH 문제 해결 패턴

**작성일**: 2025-12-14  
**최종 업데이트**: 2025-12-14  
**카테고리**: 빌드 시스템 / Monorepo / Vercel  
**태그**: `#vercel` `#turbo` `#path` `#monorepo` `#build` `#pnpm` `#corepack`

---

## 📋 문제 요약

### 증상
- Vercel 빌드에서 Turbo가 `package.json` 스크립트 실행 시 PATH를 찾지 못함
- 오류: `No such file or directory (os error 2)`
- 오류: `spawnSync /vercel/.local/share/pnpm/.tools/pnpm/10.24.0/bin/pnpm ENOENT`

### 근본 원인
**Turbo가 `package.json` 스크립트를 실행할 때 PATH 환경 변수를 제대로 상속받지 못함**

- `vercel.json`의 `buildCommand`는 작동 (쉘에서 직접 실행)
- `package.json`의 스크립트는 실패 (Turbo가 실행)
- Turbo가 자식 프로세스를 생성할 때 PATH를 상속받지 않음

---

## ✅ 검증된 해결 방법

### 방법 1: pnpm filter 사용 (권장, 현재 사용 중) ⭐

**설정** (`apps/my-app/vercel.json`):
```json
{
  "framework": "nextjs",
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm --filter=my-app... run build",
  "devCommand": "cd ../.. && pnpm --filter my-app run dev",
  "build": {
    "env": {
      "VERCEL_FORCE_NO_EDGE_RUNTIME": "1",
      "ENABLE_EXPERIMENTAL_COREPACK": "1"
    }
  }
}
```

**효과**:
- ✅ Vercel에서 안정적으로 작동 (Turbo PATH 문제 완전 우회)
- ✅ pnpm filter는 PATH 문제에 덜 민감함
- ✅ 빠르고 안정적인 빌드
- ✅ 추가 설정 불필요

**참고**: 
- `...` (세 개 점)은 의존성 패키지도 함께 빌드
- 로컬에서는 Turbo 사용 가능 (PATH 문제 없음)
- Vercel에서는 pnpm filter가 가장 안정적

---

### 방법 2: Turbo v2 Native 설정 (향후 시도 가능)

**설정** (`turbo.json`):
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalPassThroughEnv": ["PATH", "NODE", "PNPM_HOME", "NPM_CONFIG_PREFIX", "COREPACK_HOME"],
  "envMode": "loose",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    }
  }
}
```

**설정** (`package.json`):
```json
{
  "packageManager": "pnpm@10.24.0+sha512...",
  "engines": {
    "node": "22.x",
    "pnpm": ">=10.17.0"
  }
}
```

**설정** (`vercel.json`):
```json
{
  "buildCommand": "cd ../.. && turbo run build --filter=my-app --env-mode=loose",
  "build": {
    "env": {
      "ENABLE_EXPERIMENTAL_COREPACK": "1"
    }
  }
}
```

**효과**:
- ✅ Turbo의 캐싱 및 병렬 처리 최적화 활용
- ✅ `envMode: "loose"`로 모든 환경 변수 (PATH 포함) 자동 전달
- ⚠️ Vercel 환경에서는 여전히 실패할 수 있음

**주의사항**:
- ⚠️ 캐시 미스가 더 자주 발생할 수 있으나, 빌드 실패보다는 낫습니다
- ⚠️ 환경 변수 변경 시 캐시 무효화가 더 자주 발생할 수 있음

---

## 🔍 시도했지만 실패한 방법들

### ❌ --env-mode=loose 플래그만 사용
- **시도**: `turbo run build --filter=my-app --env-mode=loose`
- **결과**: 실패 (Turbo가 package.json 스크립트 실행 시 PATH를 찾지 못함)

### ❌ Node.js 스크립트 래퍼
- **시도**: `scripts/vercel-build.js` 생성하여 Turbo 실행
- **결과**: 실패 (동일한 PATH 문제)

### ❌ corepack pnpm exec turbo 패턴
- **시도**: 이전 성공 패턴인 `corepack pnpm exec turbo` 사용
- **결과**: 실패 (Turbo가 package.json 스크립트 실행 시 PATH를 찾지 못함)

---

## 📊 비교표

| 방법 | 로컬 빌드 | Vercel 빌드 | 캐싱 | 병렬 처리 | 안정성 |
|------|----------|-------------|------|----------|--------|
| **pnpm filter** | ✅ 성공 | ✅ 성공 | ⚠️ 제한적 | ⚠️ 제한적 | ⭐⭐⭐⭐⭐ |
| **Turbo + envMode: loose** | ✅ 성공 | ❌ 실패 | ✅ 우수 | ✅ 우수 | ⭐⭐⭐ |
| **Turbo + globalPassThroughEnv** | ✅ 성공 | ❌ 실패 | ✅ 우수 | ✅ 우수 | ⭐⭐⭐ |

---

## 🎯 권장 사항

### 현재 (작은 서비스 단계)
- ✅ **pnpm filter 사용** (가장 안정적)
- ✅ 로컬에서는 Turbo 사용 가능
- ✅ 추가 설정 불필요

### 향후 (서비스 확장 시)
1. **빌드 시간이 문제가 될 때**:
   - Turbo Remote Cache 검토
   - Vercel의 빌드 캐시 활용

2. **Turbo PATH 문제가 해결될 때**:
   - Turbo 업데이트 모니터링
   - 커뮤니티 해결책 확인
   - `envMode: "loose"` 재시도

---

## 🔗 관련 문서

- [상세 가이드](./TURBO_PATH_FIX.md)
- [근본 원인 분석](./ROOT_CAUSE_ANALYSIS.md)
- [빌드 전략 통일](./BUILD_STRATEGY_UNIFICATION.md)
- [진단 체크리스트](./DIAGNOSIS_CHECKLIST.md)

---

## 💡 핵심 인사이트

1. **pnpm filter는 전략적 선택**: "패배"가 아니라 현명한 전략적 선택입니다
2. **Turbo의 PATH 문제**: Vercel 환경의 제약으로 보이며, 근본 해결은 Turbo 측에서 해결해야 할 가능성이 큽니다
3. **현재 설정으로 충분**: 작은 서비스 단계에서는 pnpm filter로 충분히 빠르고 안정적입니다
4. **향후 재시도 가능**: `envMode: "loose"` 설정은 이미 적용되어 있으므로, 향후 Turbo가 개선되면 쉽게 전환 가능합니다

---

**작성자**: HUA Platform 개발팀  
**검증 상태**: ✅ 프로덕션 환경에서 검증됨
