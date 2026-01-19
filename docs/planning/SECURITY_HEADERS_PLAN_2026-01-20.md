# 보안 헤더 설정 계획 (2026-01-20)

## 개요
hua-docs, hua-official에 기본 보안 헤더 적용

## 앱별 보안 수준

| 앱 | 사용자 데이터 | 인증 | DB | 보안 수준 |
|----|-------------|------|-----|----------|
| my-app | O (일기, 암호화) | O | O | **강력** (완료) |
| hua-official | X | X | X | 기본 |
| hua-docs | X | X | X | 기본 |

---

## hua-official 보안 헤더

### 적용할 헤더

```typescript
// apps/hua-official/next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // CSP
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 개발용, 프로덕션에서 조정
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
          ].join('; '),
        },
        // 클릭재킹 방지
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        // MIME 스니핑 방지
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        // Referrer 정책
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        // 서버 정보 숨김
        {
          key: 'X-Powered-By',
          value: '', // 또는 poweredByHeader: false
        },
      ],
    },
  ];
},
poweredByHeader: false,
```

---

## hua-docs 보안 헤더

### 적용할 헤더

```typescript
// apps/hua-docs/next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // CSP (코드 블록 하이라이팅 등 고려)
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 코드 하이라이팅용
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self'",
            "frame-ancestors 'none'",
          ].join('; '),
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
},
poweredByHeader: false,
```

---

## 체크리스트

### hua-official
- [ ] next.config.ts에 headers() 추가
- [ ] poweredByHeader: false 추가
- [ ] 로컬 빌드 테스트
- [ ] Vercel preview 확인

### hua-docs
- [ ] next.config.ts에 headers() 추가
- [ ] poweredByHeader: false 추가
- [ ] 코드 하이라이팅 정상 작동 확인
- [ ] 로컬 빌드 테스트
- [ ] Vercel preview 확인

---

## 불필요한 것들 (docs/official에는 필요 없음)

| 항목 | 이유 |
|------|------|
| CSRF 보호 | 폼 제출/상태 변경 없음 |
| 세션 관리 | 로그인 없음 |
| 암호화 | 민감 데이터 없음 |
| Rate Limiting | API 없음 (정적 사이트) |
| 입력 검증 | 사용자 입력 없음 |

---

## 참고: my-app 보안 설정 (완료)

- [x] CSP 헤더 (프로덕션 강화)
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] Referrer-Policy
- [x] Permissions-Policy
- [x] poweredByHeader: false
- [x] CSRF 보호
- [x] Rate Limiting
- [x] 암호화 (AES-256-GCM)
