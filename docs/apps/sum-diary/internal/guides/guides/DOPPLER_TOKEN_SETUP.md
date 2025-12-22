# Doppler Token 설정 가이드

**작성일**: 2025-12-11  
**목적**: Vercel에서 Doppler를 사용하기 위한 `DOPPLER_TOKEN` 설정 방법

⚠️ **주의**: Doppler는 유료 서비스입니다. 현재는 Vercel 환경 변수를 직접 사용하는 방식을 권장합니다.

---

## 🔴 현재 상황

Vercel 빌드 시 다음 오류 발생:
```
Doppler Error: you must provide a token
Error: Command "cd ../.. && doppler run --config prd -- corepack pnpm exec turbo run build --filter=my-app" exited with 1
```

**원인**: Vercel 환경 변수에 `DOPPLER_TOKEN`이 설정되지 않음

---

## ✅ 해결 방법

### 단계 1: Doppler 대시보드에서 Service Token 생성

1. **Doppler 대시보드 접속**
   - https://dashboard.doppler.com 접속
   - 로그인

2. **프로젝트 선택**
   - `my-app` 프로젝트 선택 (또는 해당 프로젝트)

3. **Service Token 생성**
   - 좌측 메뉴에서 **Settings** > **Access** 클릭
   - **Service Tokens** 탭 선택
   - **Generate Service Token** 버튼 클릭
   - 이름 입력: `vercel-production` (또는 원하는 이름)
   - **Config** 선택: `prd` (프로덕션)
   - **Generate Token** 클릭
   - ⚠️ **중요**: 생성된 토큰을 즉시 복사 (다시 볼 수 없음!)

4. **토큰 형식**
   ```
   dp.st.xxxxx.xxxxx.xxxxx
   ```

---

### 단계 2: Vercel 환경 변수에 추가

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - `my-app` 프로젝트 선택

2. **환경 변수 추가**
   - **Settings** > **Environment Variables** 클릭
   - **Add New** 클릭
   - 다음 정보 입력:
     - **Key**: `DOPPLER_TOKEN`
     - **Value**: (Doppler에서 복사한 토큰)
     - **Environment**: 
       - ✅ Production
       - ✅ Preview
       - ✅ Development
     - **Add** 클릭

3. **확인**
   - 환경 변수 목록에 `DOPPLER_TOKEN`이 표시되는지 확인

---

### 단계 3: vercel.json에 Doppler 추가 (현재는 제거됨)

Doppler Token을 설정한 후, `vercel.json`을 다시 업데이트:

```json
{
  "framework": "nextjs",
  "installCommand": "corepack enable && corepack prepare pnpm@10.24.0 --activate && cd ../.. && corepack pnpm install --frozen-lockfile --ignore-scripts=false && curl -Ls --tlsv1.2 --proto \"=https\" --retry 3 https://cli.doppler.com/install.sh | sh",
  "buildCommand": "cd ../.. && doppler run --config prd -- corepack pnpm exec turbo run build --filter=my-app",
  "devCommand": "cd ../.. && pnpm --filter my-app run dev"
}
```

---

## 🔄 현재 상태

**현재 방식 (권장)**: Doppler를 제거하고 Vercel 환경 변수 직접 사용
- `vercel.json`에서 Doppler CLI 설치 및 `doppler run` 제거
- Vercel 환경 변수를 직접 사용
- 로컬 개발: Doppler 사용 (무료 플랜)
- 프로덕션: Vercel 환경 변수 직접 관리

**Doppler Sync 사용하려면** (유료 서비스):
1. Doppler 유료 플랜 구독
2. 위의 단계 1-2를 따라 `DOPPLER_TOKEN` 설정
3. `vercel.json`을 다시 업데이트하여 Doppler 추가

**권장**: 비용을 고려할 때 현재 방식(Vercel 환경 변수 직접 사용)을 권장합니다.

---

## 📝 참고사항

### Doppler Config 선택
- **Production**: `prd` (프로덕션 환경)
- **Preview**: `prd` 또는 `stg` (프리뷰 환경)
- **Development**: `dev` (개발 환경)

### 보안
- Service Token은 프로젝트별로 생성
- 각 환경(Production, Preview, Development)에 맞는 Config 사용
- 토큰은 절대 공개 저장소에 커밋하지 않음

### 문제 해결
- **토큰이 작동하지 않으면**: 
  - 토큰이 올바른 프로젝트와 Config에 연결되어 있는지 확인
  - 토큰이 만료되지 않았는지 확인
  - Vercel 환경 변수가 올바른 환경에 설정되어 있는지 확인

---

## 🔗 관련 문서

- [Doppler Service Tokens](https://docs.doppler.com/docs/service-tokens)
- [Doppler Vercel Integration](https://docs.doppler.com/docs/integrate-vercel)
- [환경 변수 관리 전략](./ENVIRONMENT_VARIABLE_STRATEGY.md)

