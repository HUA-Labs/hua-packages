# 이메일 설정 가이드

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16

## 개요

이 문서는 숨다이어리 서비스의 이메일 설정에 대한 통합 가이드입니다.

---

## 1. Gmail Workspace 이메일 주소 생성

### 1.1 권장 보조 이메일 주소 목록

| 이메일 주소 | 용도 | 타입 | 우선순위 |
|-----------|------|------|---------|
| `contact@hua.ai.kr` | 문의하기, 고객 지원 | 그룹 | 필수 |
| `noreply@hua.ai.kr` | 시스템 알림, 자동 발송 | 그룹/앨리어스 | 필수 |
| `support@hua.ai.kr` | 기술 지원 | 그룹 | 권장 |
| `notifications@hua.ai.kr` | 알림 전용 | 그룹 | 선택 |
| `admin@hua.ai.kr` | 관리자 전용 | 그룹 | 선택 |

### 1.2 contact@hua.ai.kr 그룹 이메일 생성

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

### 1.3 noreply@hua.ai.kr 그룹 생성

**용도:**
- 시스템 자동 알림 (회원가입, 비밀번호 재설정 등)
- 마케팅 이메일
- 자동화된 이메일 발송

**방법: Google Admin Console에서 그룹 생성**

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

**참고:** 
- 모든 이메일 주소를 그룹으로 만드는 것을 권장합니다
- 일관성 유지 및 나중에 멤버 추가/제거가 쉬움

---

## 2. 이메일 전송 기능 구현

### 2.1 옵션 1: Resend (권장)

**장점:**
- 간단한 API
- 트랜잭션 이메일에 최적화
- 무료 플랜: 월 3,000통
- 한국어 지원

**설정:**
1. [Resend](https://resend.com) 가입
2. API 키 생성
3. 도메인 인증 (선택사항)
4. 환경 변수 설정:
```env
RESEND_API_KEY="re_your-api-key"
EMAIL_FROM="noreply@hua.ai.kr"
```

### 2.2 옵션 2: AWS SES

**장점:**
- 저렴한 비용
- 높은 신뢰성
- 대량 발송 가능

**단점:**
- 설정 복잡
- 도메인 인증 필수
- Sandbox 모드 제한

**설정:**
1. AWS SES 콘솔 접속
2. 도메인 인증
3. SMTP 자격 증명 생성
4. 환경 변수 설정:
```env
AWS_SES_REGION="us-east-1"
AWS_SES_ACCESS_KEY="your-access-key"
AWS_SES_SECRET_KEY="your-secret-key"
EMAIL_FROM="noreply@hua.ai.kr"
```

자세한 내용은 [AWS SES 이메일 인증 문제 해결](./AWS_SES_EMAIL_VERIFICATION_TROUBLESHOOTING.md) 참조

### 2.3 옵션 3: Gmail Workspace SMTP

**장점:**
- 이미 설정된 Gmail Workspace 사용
- 추가 비용 없음
- 간단한 설정

**단점:**
- 일일 발송 제한 (약 2,000통)
- 트랜잭션 이메일에 최적화되지 않음

**설정:**
1. Gmail Workspace에서 앱 비밀번호 생성
2. 환경 변수 설정:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@hua.ai.kr"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@hua.ai.kr"
```

---

## 3. 환경 변수 설정

### 3.1 이메일 서비스 설정

**Resend 사용 시:**
```env
RESEND_API_KEY="re_your-api-key"
EMAIL_FROM="noreply@hua.ai.kr"
EMAIL_REPLY_TO="contact@hua.ai.kr"
```

**AWS SES 사용 시:**
```env
AWS_SES_REGION="us-east-1"
AWS_SES_ACCESS_KEY="your-access-key"
AWS_SES_SECRET_KEY="your-secret-key"
EMAIL_FROM="noreply@hua.ai.kr"
EMAIL_REPLY_TO="contact@hua.ai.kr"
```

**Gmail SMTP 사용 시:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@hua.ai.kr"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@hua.ai.kr"
EMAIL_REPLY_TO="contact@hua.ai.kr"
```

### 3.2 이메일 주소 설정

```env
# 발신자 이메일
EMAIL_FROM="noreply@hua.ai.kr"

# 회신 주소
EMAIL_REPLY_TO="contact@hua.ai.kr"

# 문의 이메일
EMAIL_CONTACT="contact@hua.ai.kr"

# 지원 이메일
EMAIL_SUPPORT="support@hua.ai.kr"
```

---

## 4. 이메일 템플릿

### 4.1 기본 이메일 템플릿 구조

```typescript
// 이메일 템플릿 예시
const emailTemplate = {
  from: 'noreply@hua.ai.kr',
  to: user.email,
  subject: '이메일 제목',
  html: `
    <html>
      <body>
        <h1>안녕하세요, ${user.name}님</h1>
        <p>이메일 내용</p>
      </body>
    </html>
  `,
  text: '텍스트 버전 (선택사항)',
};
```

### 4.2 이메일 타입

**시스템 알림:**
- 회원가입 환영 이메일
- 비밀번호 재설정
- 이메일 인증

**마케팅:**
- 기능 소개
- 이벤트 안내
- 뉴스레터

---

## 5. 문제 해결

### 5.1 이메일 인증 문제

**AWS SES Sandbox 모드:**
- 도메인 인증 필요
- 프로덕션 요청 필요
- 자세한 내용은 [AWS SES 이메일 인증 문제 해결](./AWS_SES_EMAIL_VERIFICATION_TROUBLESHOOTING.md) 참조

### 5.2 이메일 발송 실패

**확인 사항:**
- API 키/자격 증명 확인
- 도메인 인증 상태 확인
- 발송 제한 확인
- 스팸 필터 확인

---

## 참고 문서

이 문서는 다음 문서들을 통합한 것입니다:
- 이메일 설정 가이드 (archive)
- 이메일 환경 변수 설정 (archive)
- Gmail Workspace 이메일 설정 (archive)
- AWS SES 이메일 인증 문제 해결 (archive)

상세 내용은 `guides/archive/` 폴더를 참조하세요.

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
