---
name: infra
description: 프로덕션/dev 인프라 구성 — Vercel, Supabase, Redis, sum-back 미니PC, DB 백업
type: reference
---

## 프로덕션

- **Vercel**: Pro, **서울 (icn1)**
- **Supabase DB**: **서울 (ap-northeast-2)**, PG 17, IPv6 기본 (Direct Connection에 IPv4 Add-on 필요, 풀러 사용)
- **Upstash Redis**: **도쿄 (ap-northeast-1)**, 무료 (500K cmd/월)
- DATABASE_URL: Transaction Pooler (port 6543, `?pgbouncer=true` 필수)
- DIRECT_URL: Session Pooler (port 5432)
- 구 싱가포르 프로젝트 ref: `pwpweyzxhblyjglawesg` / 신 서울: `fgftptvvwoemmvojspgf`

## sum-back 미니PC (Celeron G4930T, 2코어, 12GB RAM, Ubuntu)

- 테일스케일 접속: `ssh devin@sum-back`
- Docker: PostgreSQL(:5432) + Redis(:6379) + Uptime Kuma(:3001)
- cron: DB 백업 매일 새벽 4시 KST (`~/backups/dump-supabase.sh`)
- 백업 위치: `~/backups/dumps/`, 7일 보관, gzip 압축
- pg_dump 경로: `/usr/lib/postgresql/17/bin/pg_dump` (PG 17)
- Doppler CLI 설치됨, my-app dev config 연결
- devin 유저 NOPASSWD sudo 설정됨
- Uptime Kuma: my-app 프로덕션 + Supabase DB 모니터링, Discord 알림 연결

## dev 환경

- Redis: `redis://sum-back:6379` (Doppler dev config)
- 로컬 PG: sum-back:5432

## 주의사항

- `app/lib/api/` 내 `error.ts` 파일명 금지 — Next.js Error Boundary 예약어
- Uptime Kuma에서 Docker 컨테이너 모니터링 시 `172.17.0.x` IP 사용 (bridge network)
