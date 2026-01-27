# 환경 변수 관리 전략

**작성일**: 2025-12-11  
**목적**: 로컬 개발(Doppler)과 Vercel 배포 환경 변수 관리 전략 정리

---

## 📋 현재 상황

### 로컬 개발 환경
- **Doppler 사용**: `doppler run -- <command>`
- **로컬 대체**: `.env` 파일 + `dotenv -e .env -- <command>`
- **예시**: `"dev": "doppler run -- next dev --webpack"`

### Vercel 배포 환경
- **Vercel 환경 변수**: Vercel 대시보드에서 직접 설정
- **자동 주입**: Vercel이 빌드/런타임에 자동으로 환경 변수 주입
- **예시**: `process.env.DATABASE_URL` (Vercel에서 설정)

---

## 🎯 권장 전략

### 옵션 1: Doppler Sync 도입 (유료 서비스) ⚠️

**주의**: Doppler는 유료 서비스입니다. 무료 플랜이 있지만 제한이 있을 수 있습니다.

**장점:**
- ✅ 환경 변수 관리 중앙화
- ✅ Doppler에서 Vercel로 자동 동기화
- ✅ 로컬과 프로덕션 환경 일관성 유지
- ✅ 환경 변수 변경 추적 및 버전 관리

**단점:**
- ❌ 유료 서비스 (비용 발생)
- ❌ 추가 도구 의존성
- ❌ 설정 복잡도 증가

**구현 방법:**

#### 1. Doppler CLI 설치 및 설정
```bash
# Doppler CLI 설치
pnpm add -g doppler

# Doppler 로그인
doppler login

# 프로젝트 설정
doppler setup
```

#### 2. Vercel과 Doppler 연동

**방법 A: Vercel Build Command에서 Doppler 사용 (구현됨) ✅**
```json
// vercel.json
{
  "installCommand": "... && curl -Ls --tlsv1.2 --proto \"=https\" --retry 3 https://cli.doppler.com/install.sh | sh",
  "buildCommand": "cd ../.. && doppler run --config prd -- corepack pnpm exec turbo run build --filter=my-app"
}
```

**구현 내용:**
- `installCommand`에 Doppler CLI 설치 추가
- `buildCommand`에 `doppler run --config prd --` 추가
- Vercel 빌드 시 Doppler에서 환경 변수 자동 로드
- `--config prd`로 프로덕션 환경 변수 사용

**주의사항:**
- Vercel 환경 변수에 `DOPPLER_TOKEN` 설정 필요
  - Doppler 대시보드에서 Service Token 생성
  - Vercel 프로젝트 Settings > Environment Variables에 추가
  - 환경: Production, Preview, Development 모두 설정
- Doppler 프로젝트 설정 필요 (`doppler setup`)
  - 프로젝트 이름: `my-app` (또는 `my-api`)
  - Config: `prd` (프로덕션), `dev` (개발), `stg` (스테이징)

**설정 단계:**
1. Doppler 대시보드에서 Service Token 생성
   - Settings > Access > Service Tokens
   - 새 토큰 생성 (이름: `vercel-production`)
   - 토큰 복사
2. Vercel 환경 변수 추가
   - Vercel 프로젝트 > Settings > Environment Variables
   - Key: `DOPPLER_TOKEN`
   - Value: (Doppler에서 복사한 토큰)
   - 환경: Production, Preview, Development 모두 선택
3. Doppler 프로젝트 설정 확인
   ```bash
   doppler setup
   # 프로젝트: my-app
   # Config: prd
   ```

**방법 B: Doppler Secrets를 Vercel로 동기화 (수동)**
```bash
# Doppler에서 환경 변수 다운로드
doppler secrets download --format env --no-file > .env.production

# Vercel CLI로 환경 변수 업로드
vercel env add DATABASE_URL < .env.production
vercel env add NEXTAUTH_SECRET < .env.production
# ... (각 환경 변수마다 반복)
```

**방법 C: Doppler Sync 자동화 스크립트**
```bash
# scripts/sync-env-to-vercel.sh
#!/bin/bash
doppler secrets download --format env --no-file | while IFS='=' read -r key value; do
  if [ -n "$key" ] && [ -n "$value" ]; then
    vercel env add "$key" "$value" production
  fi
done
```

#### 3. GitHub Actions로 자동 동기화
```yaml
# .github/workflows/sync-doppler-to-vercel.yml
name: Sync Doppler to Vercel
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *' # 매일 자정

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dopplerhq/cli-action@v1
        with:
          token: ${{ secrets.DOPPLER_TOKEN }}
      - name: Sync to Vercel
        run: |
          doppler secrets download --format env --no-file | \
          while IFS='=' read -r key value; do
            if [ -n "$key" ] && [ -n "$value" ]; then
              vercel env add "$key" "$value" production
            fi
          done
```

---

### 옵션 2: 현재 방식 유지 (권장) ⭐

**장점:**
- ✅ 구현 간단
- ✅ 추가 도구 불필요
- ✅ Vercel 네이티브 기능 활용
- ✅ 무료 (추가 비용 없음)
- ✅ 로컬 개발: Doppler 사용 가능 (무료 플랜)
- ✅ 프로덕션: Vercel 환경 변수 직접 사용

**단점:**
- ❌ 환경 변수 관리 분산 (Doppler + Vercel)
- ❌ 수동 동기화 필요
- ❌ 환경 변수 변경 추적 어려움

**권장**: 비용을 고려할 때 현재 방식(옵션 2)을 권장합니다.

**유지 방법:**
1. **로컬**: Doppler 계속 사용
2. **Vercel**: Vercel 환경 변수 수동 관리
3. **동기화**: Doppler에서 변경 시 Vercel에 수동 반영

---

## 🔄 마이그레이션 계획

### 단계 1: 현재 환경 변수 목록 정리
```bash
# Doppler에서 환경 변수 목록 확인
doppler secrets

# Vercel에서 환경 변수 목록 확인
vercel env ls
```

### 단계 2: 중복 제거
- Doppler와 Vercel에 동일한 환경 변수가 있는지 확인
- 불필요한 환경 변수 제거

### 단계 3: Doppler Sync 도입 (선택)
- Doppler Sync 스크립트 작성
- GitHub Actions 워크플로우 설정
- 자동 동기화 테스트

---

## 📝 환경 변수 분류

### 공통 환경 변수 (Doppler + Vercel)
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

### Vercel 전용 환경 변수
- `VERCEL_URL` (자동 생성)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob Storage)
- `NEXT_PUBLIC_*` (클라이언트 노출 변수)

### Doppler 전용 환경 변수
- 로컬 개발 전용 설정
- 테스트용 API 키

---

## 🔐 보안 고려사항

1. **환경 변수 암호화**
   - Doppler: 자동 암호화
   - Vercel: Plain Text 또는 Secret Reference

2. **접근 제어**
   - Doppler: 팀 멤버별 권한 관리
   - Vercel: 프로젝트별 권한 관리

3. **환경 변수 노출 방지**
   - `.env` 파일은 `.gitignore`에 포함
   - `NEXT_PUBLIC_*`만 클라이언트에 노출
   - 민감한 정보는 서버 사이드에서만 사용

---

## 📚 참고 자료

- [Doppler Documentation](https://docs.doppler.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Doppler Vercel Integration](https://docs.doppler.com/docs/integrate-vercel)

---

## ✅ 체크리스트

### 현재 상태 확인
- [ ] Doppler 환경 변수 목록 확인
- [ ] Vercel 환경 변수 목록 확인
- [ ] 중복 환경 변수 식별
- [ ] 불필요한 환경 변수 제거

### Doppler Sync 도입 (선택)
- [ ] Doppler CLI 설치 및 설정
- [ ] Vercel 연동 방법 선택 (A/B/C)
- [ ] 동기화 스크립트 작성
- [ ] 자동 동기화 테스트
- [ ] 문서화 업데이트

### 현재 방식 유지
- [ ] 환경 변수 관리 프로세스 문서화
- [ ] 수동 동기화 가이드 작성
- [ ] 정기적인 동기화 일정 설정

