# 인증 및 권한 관리 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **NextAuth.js**를 기반으로 인증 시스템을 구현하며, **역할 기반 접근 제어 (RBAC)**를 통해 권한을 관리합니다. 이 문서는 실제 구현 코드를 기반으로 인증 및 권한 관리 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- Privacy-First: 모든 개인정보 암호화 저장
- 다중 인증 방식: Credentials, Kakao, Google
- 게스트 모드 지원: 로그인 없이 체험 가능
- 자동 마이그레이션: 게스트 일기 자동 연결

---

## 1. 시스템 구조

### 1.1 인증 플로우

```
사용자 로그인 요청
    ↓
인증 프로바이더 선택
    ├─ Credentials (이메일/비밀번호)
    ├─ Kakao (소셜 로그인)
    └─ Google (소셜 로그인)
    ↓
인증 처리
    ├─ Credentials: 이메일 해시 검색 → 비밀번호 검증
    ├─ Kakao/Google: OAuth 플로우
    └─ 사용자 정보 조회/생성
    ↓
게스트 일기 마이그레이션 (첫 로그인 시)
    ↓
JWT 토큰 생성
    ↓
세션 생성
    ↓
쿠키 설정
    ↓
리다이렉트
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/auth.ts`: NextAuth 설정
- `app/api/auth/[...nextauth]/route.ts`: NextAuth 핸들러
- `app/api/auth/register/route.ts`: 회원가입 API
- `app/lib/admin.ts`: 관리자 권한 확인

---

## 2. 인증 프로바이더

### 2.1 Credentials Provider

**구현:** `CredentialsProvider`

**인증 프로세스:**
1. 이메일 해시로 사용자 검색
2. 비밀번호 검증 (bcrypt)
3. 암호화된 데이터 복호화
4. 사용자 정보 반환

**코드:**
```typescript
async authorize(credentials) {
  // 해시로 사용자 검색 (평문 저장 안 함)
  const emailHash = hashUserData(credentials.email);
  const user = await prisma.user.findUnique({
    where: { email_hash: emailHash }
  });

  // 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password_hash || ""
  );

  // 암호화된 데이터 복호화
  const decryptedEmail = decryptUserData(user.email_enc);
  const decryptedNickname = decryptUserData(user.nickname_enc);

  return {
    id: user.id,
    email: decryptedEmail,
    name: decryptedNickname,
    provider: 'credentials',
  };
}
```

**보안:**
- 평문 이메일 저장 안 함 (해시만 저장)
- 비밀번호 bcrypt 해시 (12 rounds)
- 암호화된 개인정보 복호화 후 반환

### 2.2 Kakao Provider

**구현:** `KakaoProvider`

**OAuth 플로우:**
1. Kakao OAuth 인증
2. 사용자 정보 조회
3. Account 테이블 확인
4. User 생성/조회
5. Account 연결

**환경 변수:**
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`

### 2.3 Google Provider

**구현:** `GoogleProvider`

**OAuth 플로우:**
1. Google OAuth 인증
2. 사용자 정보 조회
3. Account 테이블 확인
4. User 생성/조회
5. Account 연결

**환경 변수:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 3. 세션 관리

### 3.1 JWT 전략

**설정:**
```typescript
session: {
  strategy: "jwt",
  maxAge: 2 * 60 * 60, // 2시간
  updateAge: 60 * 60, // 1시간마다 토큰 갱신
}
```

**특징:**
- JWT 기반 세션 (서버리스 환경에 적합)
- 2시간 만료
- 1시간마다 자동 갱신

### 3.2 JWT 콜백

**구현:** `jwt` callback

**처리 내용:**
1. 첫 로그인 시 account 정보 저장
2. 사용자 정보 조회
3. 암호화된 데이터 복호화
4. 토큰에 사용자 정보 포함

**코드:**
```typescript
async jwt({ token, user, account }) {
  // 첫 로그인 시 account 정보 저장
  if (account) {
    token.accessToken = account.access_token;
    token.provider = account.provider;
    token.providerAccountId = account.providerAccountId;
  }
  
  // 사용자 정보 조회 및 복호화
  if (dbUser) {
    const decryptedEmail = decryptUserData(dbUser.email_enc);
    const decryptedNickname = decryptUserData(dbUser.nickname_enc);
    
    token.id = dbUser.id;
    token.user = {
      id: dbUser.id,
      provider: token.provider,
      name: decryptedNickname,
      email: decryptedEmail,
      image: dbUser.profile_image,
    };
  }
  
  return token;
}
```

### 3.3 세션 콜백

**구현:** `session` callback

**처리 내용:**
1. 토큰에서 사용자 정보 추출
2. 세션에 사용자 정보 추가
3. Provider 정보 포함

**코드:**
```typescript
async session({ session, token }) {
  if (token && session.user) {
    if (token.id) {
      session.user.id = token.id;
    }
    if (token.provider) {
      session.user.provider = token.provider;
    }
    if (token.user) {
      session.user = {
        ...session.user,
        ...token.user,
      };
    }
  }
  return session;
}
```

---

## 4. 쿠키 설정

### 4.1 보안 쿠키

**설정:**
```typescript
useSecureCookies: process.env.NODE_ENV === 'production'
```

**쿠키 옵션:**
- `httpOnly: true`: JavaScript 접근 불가
- `sameSite: 'lax'`: CSRF 방지
- `secure: true` (프로덕션): HTTPS만 허용

### 4.2 쿠키 타입

**Session Token:**
- 이름: `next-auth.session-token`
- 만료: 세션 만료 시

**Callback URL:**
- 이름: `next-auth.callback-url`
- 만료: 리다이렉트 후

**CSRF Token:**
- 이름: `next-auth.csrf-token`
- 만료: 세션 만료 시

**PKCE Code Verifier:**
- 이름: `next-auth.pkce.code_verifier`
- 만료: 15분

**State:**
- 이름: `next-auth.state`
- 만료: 15분

---

## 5. 회원가입

### 5.1 회원가입 프로세스

**구현 위치:** `app/api/auth/register/route.ts`

**프로세스:**
1. 입력 검증 (이메일, 비밀번호, 닉네임)
2. 이메일 중복 검사 (해시 기반)
3. 닉네임 중복 검사 및 자동 재생성
4. 비밀번호 해시화 (bcrypt, 12 rounds)
5. 개인정보 암호화
6. 사용자 생성
7. 게스트 일기 마이그레이션

**코드:**
```typescript
// 이메일 중복 검사
const emailHash = hashUserData(email);
const existingUser = await prisma.user.findUnique({
  where: { email_hash: emailHash }
});

// 비밀번호 해시화
const hashedPassword = await bcrypt.hash(password, 12);

// 개인정보 암호화
const encryptedEmail = encryptUserData(email);
const encryptedNickname = encryptUserData(nickname);

// 사용자 생성
const newUser = await prisma.user.create({
  data: {
    email_enc: encryptedEmail,
    nickname_enc: encryptedNickname,
    email_hash: emailHash,
    nickname_hash: nicknameHash,
    password_hash: hashedPassword,
    state: 'active'
  }
});
```

### 5.2 닉네임 자동 생성

**구현:** `generateFoodNickname('auto', 'random')`

**특징:**
- 음식 이름 기반 닉네임
- 중복 시 자동 재생성 (최대 10회 시도)
- 고유성 보장

---

## 6. 게스트 일기 마이그레이션

### 6.1 마이그레이션 프로세스

**트리거:**
- 회원가입 시
- 첫 로그인 시

**프로세스:**
1. 게스트 ID 생성 (IP 기반)
2. 게스트 일기 조회
3. 일기 user_id 업데이트
4. 분석 결과 자동 연결

**구현:**
```typescript
// 게스트 ID 생성
const ip = getClientIP(request);
const guestId = generateGuestId(ip);

// 일기 마이그레이션
await prisma.diaryEntry.updateMany({
  where: {
    user_id: guestId,
    deleted_at: null
  },
  data: {
    user_id: userId,
    updated_at: new Date()
  }
});
```

### 6.2 개선된 마이그레이션

**구현:** `migrateGuestDiariesFromRequestImproved`

**특징:**
- 여러 게스트 ID 통합 지원
- 클라이언트 LocalStorage 게스트 ID 지원
- 다중 기기/브라우저 일기 통합

---

## 7. 권한 관리

### 7.1 역할 기반 접근 제어 (RBAC)

**역할:**
- `USER`: 일반 사용자
- `ADMIN`: 관리자

**구현 위치:** `app/lib/admin.ts`

### 7.2 관리자 권한 확인

**구현:** `checkAdminPermission(userId?)`

**프로세스:**
1. 세션 확인
2. 사용자 ID 추출
3. 데이터베이스에서 역할 확인
4. `role === 'ADMIN'` 확인

**코드:**
```typescript
export async function checkAdminPermission(userId?: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const targetUserId = userId || session?.user?.id;
  
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true }
  });
  
  return user?.role === 'ADMIN';
}
```

### 7.3 관리자 필수 미들웨어

**구현:** `requireAdmin()`

**반환 값:**
```typescript
{
  isAdmin: boolean;
  userId?: string;
  error?: string;
}
```

**사용 예시:**
```typescript
const { isAdmin, userId, error } = await requireAdmin();
if (!isAdmin) {
  return NextResponse.json({ error }, { status: 403 });
}
```

---

## 8. 소셜 로그인 처리

### 8.1 SignIn 콜백

**구현:** `signIn` callback

**프로세스:**
1. Account 테이블에서 기존 계정 확인
2. User 찾기 (이메일/닉네임 기반)
3. User 없으면 새로 생성
4. Account 생성/업데이트

**코드:**
```typescript
async signIn({ user, account }) {
  if (account?.provider && account.provider !== 'credentials') {
    // 1. Account 테이블에서 기존 계정 확인
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        }
      }
    });
    
    // 2. User 찾기 또는 생성
    let existingUser = null;
    if (user.email) {
      const emailHash = hashUserData(user.email);
      existingUser = await prisma.user.findUnique({
        where: { email_hash: emailHash }
      });
    }
    
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          email_enc: encryptUserData(user.email),
          nickname_enc: encryptUserData(user.name),
          email_hash: hashUserData(user.email),
          nickname_hash: hashUserData(user.name),
          state: 'active',
        }
      });
    }
    
    // 3. Account 연결
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        }
      },
      create: {
        userId: existingUser.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        // ... 기타 토큰 정보
      },
      update: {
        access_token: account.access_token,
        // ... 기타 토큰 정보 업데이트
      }
    });
  }
  
  return true;
}
```

### 8.2 Provider-Agnostic 설계

**특징:**
- Kakao, Google, Apple 등 모든 소셜 로그인 지원
- 동일한 로직으로 처리
- 확장성 높음

---

## 9. 리다이렉트 보안

### 9.1 Redirect 콜백

**구현:** `redirect` callback

**보안 규칙:**
1. 상대 경로는 baseUrl과 결합
2. 같은 origin만 허용
3. 외부 URL 리다이렉트 방지

**코드:**
```typescript
async redirect({ url, baseUrl }) {
  // 상대 경로
  if (url.startsWith("/")) {
    return `${baseUrl}${url}`;
  }
  
  // 같은 origin 확인
  const urlObj = new URL(url, baseUrl);
  if (urlObj.origin === new URL(baseUrl).origin) {
    return urlObj.toString();
  }
  
  // 기본값: 홈으로
  return baseUrl;
}
```

---

## 10. 게스트 모드

### 10.1 게스트 사용자

**특징:**
- `email_hash = null`
- `nickname_hash = null`
- IP 기반 게스트 ID 생성

**게스트 ID 생성:**
```typescript
export function generateGuestId(ip: string): string {
  const guestId = crypto.createHash('sha256')
    .update(`guest_${ip}`)
    .digest('hex')
    .substring(0, 32);
  
  // UUID 형식으로 변환
  return `${guestId.substring(0, 8)}-${guestId.substring(8, 12)}-...`;
}
```

### 10.2 게스트 제한

**제한 사항:**
- 일일 3회 전송 제한
- 일부 기능 제한
- 자동 마이그레이션 지원

---

## 11. 보안 고려사항

### 11.1 개인정보 보호

**암호화:**
- 모든 개인정보 암호화 저장
- 해시로만 검색
- 복호화는 인증 시에만

**해시:**
- 이메일: SHA-256 해시
- 닉네임: SHA-256 해시
- 비밀번호: bcrypt 해시 (12 rounds)

### 11.2 세션 보안

**JWT:**
- 서버 사이드에서만 검증
- 만료 시간 설정
- 자동 갱신

**쿠키:**
- HttpOnly: JavaScript 접근 불가
- Secure: HTTPS만 (프로덕션)
- SameSite: CSRF 방지

### 11.3 CSRF 방지

**전략:**
- SameSite 쿠키
- CSRF 토큰
- Origin 검증

---

## 12. 구현 상세

### 12.1 주요 함수

**인증:**
- `getServerSession(authOptions)`: 서버 사이드 세션 조회
- `signIn(provider, options?)`: 로그인
- `signOut(options?)`: 로그아웃

**권한:**
- `checkAdminPermission(userId?)`: 관리자 권한 확인
- `requireAdmin()`: 관리자 필수 미들웨어

**게스트:**
- `generateGuestId(ip)`: 게스트 ID 생성
- `migrateGuestDiaries(guestId, userId)`: 게스트 일기 마이그레이션

### 12.2 데이터 구조

**Session:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
    provider: string;
  };
  accessToken?: string;
}
```

**JWT Token:**
```typescript
{
  id: string;
  email: string;
  name: string;
  provider: string;
  accessToken?: string;
  providerAccountId?: string;
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
    provider: string;
  };
}
```

---

## 13. 성능 고려사항

### 13.1 세션 조회 최적화

**전략:**
- JWT 기반 세션 (DB 조회 최소화)
- 토큰에 사용자 정보 포함
- 필요 시에만 DB 조회

### 13.2 병렬 처리

**회원가입:**
- 이메일/닉네임 중복 검사 병렬 가능
- 게스트 마이그레이션 비동기 처리

---

## 14. 참고 자료

### 관련 코드 파일
- `app/lib/auth.ts`: NextAuth 설정
- `app/api/auth/[...nextauth]/route.ts`: NextAuth 핸들러
- `app/api/auth/register/route.ts`: 회원가입 API
- `app/lib/admin.ts`: 관리자 권한 확인
- `app/lib/guest-migration.ts`: 게스트 마이그레이션

### 관련 문서
- [게스트 모드 시스템](./GUEST_MODE_SYSTEM.md)
- [암호화 시스템](./ENCRYPTION_SYSTEM.md)

---

## 15. 향후 개선 계획

### 15.1 계획된 개선사항

1. **2FA (Two-Factor Authentication)**
   - TOTP 기반 2단계 인증
   - SMS/이메일 인증

2. **소셜 로그인 확장**
   - Apple 로그인
   - Naver 로그인

3. **세션 관리 고도화**
   - 다중 기기 세션 관리
   - 세션 만료 알림

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
