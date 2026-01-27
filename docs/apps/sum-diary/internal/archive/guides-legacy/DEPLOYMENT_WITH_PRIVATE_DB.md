# Private Database (NAS + Tailscale) 배포 가이드

## 🎯 문제 상황

**현재 환경:**
- NAS 서버에서 PostgreSQL 실행
- Tailscale VPN으로 Private Network 구성 (100.x.x.x)
- 팀원들만 접근 가능한 안전한 구조

**배포 시 문제:**
- Vercel은 **Serverless**라서 Tailscale 클라이언트 설치 불가
- Tailscale VPN을 통한 Private Network 접근 불가능
- Public IP 노출 없이 안전하게 연결하려면?

---

## 💡 해결 방안 비교

### 옵션 1: Railway 배포 (추천 ⭐⭐⭐)

#### 왜 Railway?
- ✅ **일반 서버 환경** (Serverless 아님)
- ✅ Tailscale 클라이언트 설치 가능
- ✅ Private Network 유지
- ✅ Next.js 모노레포 지원
- ✅ 비용 저렴 ($5-10/월)

#### 배포 방법

**1. Railway 프로젝트 생성**
```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 생성
cd apps/my-app
railway init
```

**2. Dockerfile 생성**
```dockerfile
# apps/my-app/Dockerfile
FROM node:20-alpine AS base

# Tailscale 설치
RUN apk add --no-cache \
    ca-certificates \
    iptables \
    iproute2 \
    curl

# Tailscale 바이너리 다운로드
RUN curl -fsSL https://tailscale.com/install.sh | sh

# 작업 디렉토리
WORKDIR /app

# 의존성 설치 (모노레포 고려)
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY ../../packages ./packages
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Next.js 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 시작 스크립트 생성
COPY --chmod=755 <<EOF /app/start.sh
#!/bin/sh
# Tailscale 시작
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
sleep 2
tailscale up --authkey=\${TAILSCALE_AUTH_KEY} --hostname=my-app-prod

# Next.js 시작
exec node server.js
EOF

USER nextjs

EXPOSE 3000

CMD ["/app/start.sh"]
```

**3. Railway 환경 변수 설정**

Railway 대시보드 > Variables:
```bash
# Database (Tailscale IP 사용)
DATABASE_URL=postgresql://user:pass@100.x.x.x:5432/my-app
DIRECT_URL=postgresql://user:pass@100.x.x.x:5432/my-app

# Tailscale
TAILSCALE_AUTH_KEY=tskey-auth-xxxxx  # Tailscale Admin Console에서 생성

# NextAuth
NEXTAUTH_URL=https://my-app.up.railway.app
NEXTAUTH_SECRET=your-secret

# 나머지 환경 변수들...
ENCRYPTION_KEY=...
KAKAO_CLIENT_ID=...
GOOGLE_CLIENT_ID=...
OPENAI_API_KEY=...
```

**4. 배포**
```bash
railway up
```

#### Tailscale Auth Key 생성
1. https://login.tailscale.com/admin/settings/keys
2. "Generate auth key" 클릭
3. **Reusable**: ✅ 체크
4. **Ephemeral**: ❌ 체크 해제
5. **Tags**: `tag:railway` (선택)
6. 생성된 키를 Railway 환경 변수에 추가

#### 비용
- **무료 크레딧**: $5
- **예상 비용**: $5-10/월
- **스케일 업**: 사용량에 따라 자동

---

### 옵션 2: Render 배포

Render도 Railway와 비슷하게 Tailscale 지원합니다.

**차이점:**
- Railway: 사용량 기반 ($5-10/월)
- Render: 무료 플랜 (느림) 또는 $7/월 (빠름)

**설정 방법:**
- Dockerfile은 Railway와 동일
- Render 대시보드에서 Docker 배포 선택
- 환경 변수 동일하게 설정

---

### 옵션 3: NAS를 Public으로 노출 + Vercel

**⚠️ 보안 주의 필요!**

#### 설정 방법

**1. NAS 설정**
```bash
# PostgreSQL 설정 수정 (postgresql.conf)
listen_addresses = '*'

# 접근 제어 (pg_hba.conf)
# Vercel IP 대역만 허용
host    my-app    dbuser    0.0.0.0/0    scram-sha-256
```

**2. 공유기 포트 포워딩**
```
외부 포트: 5432 (또는 다른 포트)
내부 IP: NAS IP
내부 포트: 5432
```

**3. Vercel 환경 변수**
```bash
# SSL 연결 필수!
DATABASE_URL=postgresql://user:pass@your-public-ip:5432/my-app?sslmode=require
```

**4. 보안 강화**
- 강력한 비밀번호 사용
- SSL/TLS 인증서 설정
- 방화벽 규칙 (Vercel IP만 허용)
- 정기적인 보안 업데이트
- fail2ban 설치 (brute force 방지)

#### Vercel IP 대역
- 고정 IP 없음
- 모든 IP 허용 필요 (0.0.0.0/0)
- **보안 위험 높음** ⚠️

#### 비용
- NAS: $0 (기존)
- Vercel Pro: $20/월
- 총: **$20/월**

---

### 옵션 4: Supabase로 DB 마이그레이션 + Vercel

**비용:**
- Supabase 무료: 500MB (베타 충분)
- Supabase Pro: $25/월 (8GB)
- Vercel Pro: $20/월
- 총: **$0~45/월**

**장점:**
- ✅ 관리형 서비스
- ✅ 자동 백업
- ✅ 보안 걱정 없음
- ✅ 확장 쉬움

**단점:**
- ❌ 데이터 마이그레이션 필요
- ❌ 비용 증가

---

## 📊 최종 비교표

| 옵션 | 월 비용 | Tailscale | 보안 | 설정 난이도 | 추천도 |
|------|---------|-----------|------|-------------|--------|
| **Railway** | $5-10 | ✅ | ✅ 안전 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Render** | $0-7 | ✅ | ✅ 안전 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **NAS Public + Vercel** | $20 | ❌ | ⚠️ 주의 | ⭐⭐ | ⭐⭐ |
| **Supabase + Vercel** | $20-45 | ❌ | ✅ 안전 | ⭐ | ⭐⭐⭐ |

---

## 🎯 추천 전략

### Phase 1: 베타 테스트 (현재)
**Railway + NAS (Tailscale 유지)**
- 비용 최소 ($5-10/월)
- 안전한 Private Network
- 빠른 배포

### Phase 2: 초기 런칭 (사용자 ~1000명)
**계속 Railway 사용** 또는 **Render로 전환**
- 비용 여전히 저렴
- 안정적인 운영

### Phase 3: 성장 단계 (사용자 1000명+)
**Supabase 또는 AWS RDS로 마이그레이션**
- 관리형 서비스로 전환
- 자동 백업, 스케일링
- NAS는 개발/테스트용 또는 백업용으로

---

## 🚀 Railway 배포 체크리스트

### 사전 준비
- [ ] Railway 계정 생성
- [ ] Tailscale Auth Key 생성
- [ ] NAS PostgreSQL 실행 중
- [ ] 모든 환경 변수 준비

### Railway 설정
- [ ] `Dockerfile` 생성
- [ ] `railway.json` 설정 (선택)
- [ ] 환경 변수 입력
- [ ] 배포 테스트

### 배포 후 확인
- [ ] Tailscale 연결 확인
  ```bash
  railway logs
  # "Tailscale is up" 메시지 확인
  ```
- [ ] DB 연결 테스트
- [ ] 앱 접속 확인
- [ ] 로그인/회원가입 테스트

### 모니터링
- [ ] Railway 대시보드에서 메모리/CPU 사용량 확인
- [ ] 로그 모니터링
- [ ] 비용 추적

---

## 🔧 트러블슈팅

### Tailscale 연결 실패
```bash
# Railway 로그 확인
railway logs

# Auth Key 확인
# - Reusable 체크되었는지
# - 만료되지 않았는지
# - Ephemeral이 아닌지
```

### DB 연결 실패
```bash
# Railway 컨테이너에서 직접 테스트
railway run bash
ping 100.x.x.x  # NAS Tailscale IP
psql $DATABASE_URL
```

### 빌드 실패
```bash
# 모노레포 구조 확인
# Dockerfile의 경로가 올바른지 확인
# pnpm lockfile이 최신인지 확인
```

---

## 📞 참고 링크

- Railway 문서: https://docs.railway.app/
- Tailscale 문서: https://tailscale.com/kb/
- Next.js Standalone: https://nextjs.org/docs/pages/api-reference/next-config-js/output

---

**추천 순서:**
1. Railway로 베타 배포 ($5-10/월, Tailscale 유지)
2. 사용자 증가하면 Supabase 고려
3. 수익 발생하면 인프라 업그레이드

**비용 절감하면서 안전하게 배포할 수 있는 최선의 방법입니다!** 🚀

