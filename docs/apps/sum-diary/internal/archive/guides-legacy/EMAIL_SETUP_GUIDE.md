# 이메일 설정 가이드

## 📅 작성일
2025-12-14

## 📧 Gmail Workspace 이메일 주소 생성

### 권장 보조 이메일 주소 목록

| 이메일 주소 | 용도 | 타입 | 우선순위 |
|-----------|------|------|---------|
| `contact@hua.ai.kr` | 문의하기, 고객 지원 | 그룹 | ⭐⭐⭐ 필수 |
| `noreply@hua.ai.kr` | 시스템 알림, 자동 발송 | 그룹/앨리어스 | ⭐⭐⭐ 필수 |
| `support@hua.ai.kr` | 기술 지원 | 그룹 | ⭐⭐ 권장 |
| `notifications@hua.ai.kr` | 알림 전용 | 그룹 | ⭐ 선택 |
| `admin@hua.ai.kr` | 관리자 전용 | 그룹 | ⭐ 선택 |

### 1. contact@hua.ai.kr 그룹 이메일 생성

**방법: Google Admin Console에서 그룹 생성**

1. Google Admin Console 접속 (admin.google.com)
2. **그룹** → **그룹 만들기**
3. 그룹 정보 입력:
   - 그룹 이름: `Contact Support`
   - 그룹 이메일: `contact@hua.ai.kr`
   - 그룹 설명: `문의하기 이메일`
4. 멤버 추가: 실제로 이메일을 받을 관리자 이메일 주소들
5. 설정:
   - **이메일 옵션**: 외부에서 이메일 받기 허용
   - **멤버 권한**: 멤버는 이메일 보내기 가능

**장점:**
- 여러 관리자가 동시에 이메일 받을 수 있음
- 관리자 추가/제거가 쉬움
- 이메일 히스토리 공유 가능

### 2. noreply@hua.ai.kr 그룹 생성

**용도:**
- 시스템 자동 알림 (회원가입, 비밀번호 재설정 등)
- 마케팅 이메일
- 자동화된 이메일 발송

**방법: Google Admin Console에서 그룹 생성 (권장)**

1. Google Admin Console 접속
2. **그룹** → **그룹 만들기**
3. 그룹 정보 입력:
   - 그룹 이름: `No Reply`
   - 그룹 이메일: `noreply@hua.ai.kr`
   - 그룹 설명: `시스템 자동 발송 이메일`
4. **중요 설정:**
   - **이메일 옵션**: 외부에서 이메일 받기 **비허용** (noreply이므로)
   - **멤버 권한**: 멤버는 이메일 보내기 가능
   - **자동 응답**: 설정하지 않음 (noreply이므로)
5. **멤버 추가 (선택사항)**
   - 시스템 이메일만 발송하므로 멤버는 없어도 됨
   - 또는 개발자 이메일 추가 (모니터링용)

**참고:** 
- 모든 이메일 주소를 그룹으로 만드는 것을 권장합니다
- 일관성 유지 및 나중에 멤버 추가/제거가 쉬움

### 3. support@hua.ai.kr 그룹 생성 (선택사항)

**용도:** 기술 지원, 버그 리포트

**방법:**
- contact@hua.ai.kr과 동일한 방식으로 그룹 생성
- 멤버: 기술 지원팀 이메일 주소들
- 외부 이메일 받기 허용

### 4. 앨리어스 생성 (대안 - 비권장)

**참고:** 일관성을 위해 모든 이메일을 그룹으로 만드는 것을 권장합니다.

기존 사용자 계정에 앨리어스 추가 (필요한 경우만):

1. Google Admin Console → **사용자**
2. 사용자 선택 → **사용자 정보** → **앨리어스**
3. 이메일 주소 추가
4. 해당 사용자의 받은편지함으로 자동 전달

**단점:**
- 한 명만 이메일 받을 수 있음
- 나중에 멤버 추가가 어려움
- 이메일 히스토리 공유 불가

## 🔧 이메일 전송 기능 구현

### 옵션 1: Resend (권장)

**장점:**
- 간단한 API
- 트랜잭션 이메일에 최적화
- 무료 플랜: 월 3,000통
- 한국어 지원

**설정:**
```bash
pnpm add resend
```

**환경 변수:**
```env
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=contact@hua.ai.kr
NOREPLY_EMAIL=noreply@hua.ai.kr
SUPPORT_EMAIL=support@hua.ai.kr  # 선택사항
```

**구현 예시:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: '숨 다이어리 <noreply@hua.ai.kr>',
  to: process.env.CONTACT_EMAIL,
  subject: `[문의하기] ${subject}`,
  html: `
    <h2>새로운 문의가 접수되었습니다</h2>
    <p><strong>이름:</strong> ${name}</p>
    <p><strong>이메일:</strong> ${email}</p>
    <p><strong>제목:</strong> ${subject}</p>
    <p><strong>내용:</strong></p>
    <pre>${message}</pre>
  `,
});
```

### 옵션 2: Nodemailer (Gmail SMTP)

**장점:**
- Gmail Workspace와 직접 연동
- 무료 (Gmail Workspace 사용 시)
- 완전한 제어 가능

**설정:**
```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

**환경 변수:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contact@hua.ai.kr
SMTP_PASS=앱 비밀번호  # Gmail 앱 비밀번호 필요
CONTACT_EMAIL=contact@hua.ai.kr
```

**구현 예시:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: `"숨 다이어리" <${process.env.SMTP_USER}>`,
  to: process.env.CONTACT_EMAIL,
  subject: `[문의하기] ${subject}`,
  html: `...`,
});
```

### 옵션 3: SendGrid

**장점:**
- 엔터프라이즈급 기능
- 상세한 분석
- 무료 플랜: 일일 100통

## 🎯 권장 구현 방법

### 단계별 구현

1. **Resend 사용 (권장)**
   - 간단하고 빠름
   - 트랜잭션 이메일에 최적화
   - 무료 플랜으로 시작 가능

2. **문의하기 API에 이메일 전송 추가**
   - DB 저장 후 이메일 전송
   - 실패해도 DB에는 저장됨 (안전)

3. **이메일 템플릿**
   - HTML 템플릿 사용
   - 관리자가 쉽게 확인할 수 있도록 구조화

## 📝 구현 예시 코드

### Resend 사용 예시

```typescript
// app/lib/email-service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactInquiryEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryId: string;
}) {
  try {
    await resend.emails.send({
      from: `숨 다이어리 <${process.env.NOREPLY_EMAIL || 'noreply@hua.ai.kr'}>`,
      to: process.env.CONTACT_EMAIL || 'contact@hua.ai.kr',
      replyTo: data.email, // 사용자가 답장할 수 있도록
      subject: `[문의하기] ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">새로운 문의가 접수되었습니다</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>문의 ID:</strong> ${data.inquiryId}</p>
            <p><strong>이름:</strong> ${data.name}</p>
            <p><strong>이메일:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>제목:</strong> ${data.subject}</p>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3>문의 내용</h3>
            <pre style="white-space: pre-wrap; font-family: inherit;">${data.message}</pre>
          </div>
          <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
            이 이메일은 숨 다이어리 문의하기 시스템에서 자동으로 발송되었습니다.
          </p>
        </div>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return { success: false, error };
  }
}
```

### API에 통합

```typescript
// app/api/contact/route.ts
import { sendContactInquiryEmail } from '@/app/lib/email-service';

// ... 기존 코드 ...

// 문의 저장 후
const inquiry = await prisma.contactInquiry.create({...});

// 이메일 전송 (비동기, 실패해도 계속 진행)
sendContactInquiryEmail({
  name,
  email,
  subject,
  message,
  inquiryId: inquiry.id,
}).catch(error => {
  console.error('이메일 전송 실패 (무시됨):', error);
});

return NextResponse.json({
  success: true,
  message: '문의가 성공적으로 전송되었습니다.',
  inquiryId: inquiry.id
});
```

## 🔐 Gmail 앱 비밀번호 생성 (Nodemailer 사용 시)

1. Google 계정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. "메일" 및 "기타(맞춤 이름)" 선택
5. 생성된 16자리 비밀번호 사용

## 📊 비교표

| 서비스 | 무료 플랜 | 설정 난이도 | 한국어 지원 | 추천도 |
|--------|----------|------------|------------|--------|
| Resend | 월 3,000통 | ⭐ 매우 쉬움 | ✅ | ⭐⭐⭐⭐⭐ |
| Nodemailer (Gmail) | 무제한* | ⭐⭐ 보통 | ✅ | ⭐⭐⭐⭐ |
| SendGrid | 일일 100통 | ⭐⭐⭐ 어려움 | ⚠️ | ⭐⭐⭐ |

*Gmail Workspace 사용 시

## 🎯 다음 단계

1. Gmail Workspace에서 `contact@hua.ai.kr` 그룹 생성
2. Resend 계정 생성 및 API 키 발급
3. 환경 변수 설정
4. 이메일 전송 기능 구현
5. 테스트
