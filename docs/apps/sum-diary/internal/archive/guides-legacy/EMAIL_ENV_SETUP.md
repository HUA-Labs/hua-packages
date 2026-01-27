# 이메일 환경 변수 설정 가이드

## 📅 작성일
2025-12-14

## 🔧 AWS SES 환경 변수 설정

### Doppler에 추가할 환경 변수

```env
# AWS SES 설정 (my-api와 동일한 환경 변수 사용)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_REGION=ap-northeast-2  # 서울 리전 (도메인 인증된 리전)
AWS_SES_FROM_EMAIL=noreply@hua.ai.kr

# 이메일 주소
CONTACT_EMAIL=contact@hua.ai.kr
NOREPLY_EMAIL=noreply@hua.ai.kr
SUPPORT_EMAIL=support@hua.ai.kr  # 선택사항
```

### AWS SES 설정 방법

1. **AWS 콘솔 접속**
   - https://console.aws.amazon.com/ses 접속
   - AWS SES 서비스 선택

2. **도메인 인증 확인**
   - `hua.ai.kr` 도메인이 이미 인증되어 있어야 함
   - Verified identities에서 확인

3. **IAM 사용자 생성 (이메일 전송용)**
   - IAM 콘솔 → 사용자 → 사용자 추가
   - 사용자 이름: `my-app-ses-user`
   - 액세스 유형: 프로그래밍 방식 액세스
   - 권한: `AmazonSESFullAccess` 정책 연결
   - 또는 커스텀 정책으로 `ses:SendEmail`, `ses:SendRawEmail` 권한만 부여

4. **액세스 키 생성**
   - 사용자 생성 후 액세스 키 ID와 비밀 액세스 키 복사
   - Doppler에 `AWS_ACCESS_KEY_ID`와 `AWS_SECRET_ACCESS_KEY`로 저장

### Doppler 설정 방법

1. Doppler Dashboard 접속
2. 프로젝트 선택 (my-app)
3. 환경 선택 (dev, staging, production)
4. **Secrets** 탭 클릭
5. 다음 환경 변수 추가:

```
AWS_ACCESS_KEY_ID = [액세스 키 ID]
AWS_SECRET_ACCESS_KEY = [비밀 액세스 키]
AWS_SES_REGION = ap-northeast-2  # 서울 리전 (도메인 인증된 리전과 일치해야 함)
AWS_SES_FROM_EMAIL = noreply@hua.ai.kr
CONTACT_EMAIL = contact@hua.ai.kr
NOREPLY_EMAIL = noreply@hua.ai.kr
```

### 로컬 개발 환경 (.env 파일)

로컬 개발 시에는 `.env.local` 파일에 추가:

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_REGION=ap-northeast-2
AWS_SES_FROM_EMAIL=noreply@hua.ai.kr
CONTACT_EMAIL=contact@hua.ai.kr
NOREPLY_EMAIL=noreply@hua.ai.kr
```

## ✅ 테스트 방법

### 1. 환경 변수 확인

```typescript
// app/api/contact/route.ts에서 테스트
console.log('AWS SES 설정:', {
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  fromEmail: process.env.AWS_SES_FROM_EMAIL || process.env.FROM_EMAIL,
  contactEmail: process.env.CONTACT_EMAIL,
});
```

### 2. 문의하기 테스트

1. 문의하기 페이지에서 실제 문의 전송
2. `contact@hua.ai.kr` 그룹 이메일 받은편지함 확인
3. 이메일이 정상적으로 도착하는지 확인

### 3. 로그 확인

서버 로그에서 다음 메시지 확인:
- `문의 저장 완료:` - DB 저장 성공
- `문의하기 이메일 전송 성공 (AWS SES):` - 이메일 전송 성공
- `문의하기 이메일 전송 실패 (AWS SES):` - 이메일 전송 실패 (원인 확인 필요)

## ⚠️ 주의사항

1. **AWS 인증 정보 보안**
   - 절대 코드에 하드코딩하지 않기
   - Doppler에만 저장
   - GitHub에 커밋하지 않기
   - IAM 사용자는 최소 권한 원칙 적용 (SES 전송 권한만)

2. **AWS 인증 정보가 없을 때**
   - 이메일 전송은 건너뛰지만 DB에는 저장됨
   - 로그에 경고 메시지 표시
   - 기능적으로는 문제없음 (나중에 이메일 전송 가능)

3. **AWS SES 제한**
   - 일일 발송 제한: **50,000통** (프로덕션 환경)
   - 초당 발송 제한: 14통 (기본값, 증가 요청 가능)
   - 샌드박스 모드: 처음에는 인증된 이메일로만 발송 가능
   - 프로덕션 액세스 요청 필요 (AWS 콘솔에서 요청)

## 🔐 AWS SES 이메일/도메인 인증 (필수)

### 현재 오류
```
MessageRejected: Email address is not verified
```

이 오류는 AWS SES에서 발신/수신 이메일 주소가 인증되지 않아서 발생합니다.

### 해결 방법

#### 방법 1: 이메일 주소 인증 (빠른 해결)

1. **AWS SES 콘솔 접속**
   - https://console.aws.amazon.com/ses 접속
   - 리전: `ap-southeast-2` (또는 사용 중인 리전) 선택

2. **Verified identities** → **Create identity**

3. **이메일 주소 인증**
   - Identity type: **Email address** 선택
   - Email address 입력:
     - `noreply@hua.ai.kr` (발신 주소)
     - `contact@hua.ai.kr` (수신 주소)
   - **Create identity** 클릭

4. **이메일 확인**
   - 입력한 이메일 주소로 인증 메일 발송됨
   - 이메일 받은편지함에서 링크 클릭하여 인증 완료

5. **인증 완료 확인**
   - AWS SES 콘솔에서 상태가 **Verified**로 변경되면 완료

#### 방법 2: 도메인 인증 (권장 - 더 유연함)

1. **도메인 인증**
   - Identity type: **Domain** 선택
   - Domain name: `hua.ai.kr` 입력
   - **Create identity** 클릭

2. **DNS 레코드 추가**
   - AWS에서 제공하는 DNS 레코드를 도메인 DNS에 추가
   - DKIM 레코드도 추가 (이메일 신뢰도 향상)

3. **인증 완료 확인**
   - DNS 전파 후 AWS SES에서 **Verified** 상태 확인

### 인증 후 테스트

이메일/도메인 인증이 완료되면 다시 문의하기를 테스트해보세요.

## 🚀 AWS SES 프로덕션 액세스 요청

샌드박스 모드에서는 인증된 이메일로만 발송 가능합니다. 프로덕션 액세스를 요청하면 모든 이메일 주소로 발송 가능합니다:

1. AWS SES 콘솔 접속
2. **Account dashboard** → **Request production access**
3. 사용 사례 작성:
   - 이메일 유형: Transactional (트랜잭션)
   - 웹사이트 URL: https://my-app.com (또는 실제 도메인)
   - 이메일 내용: 문의하기 알림, 시스템 알림 등
4. 제출 후 승인 대기 (보통 24시간 이내)

## 📝 참고

- AWS SES 문서: https://docs.aws.amazon.com/ses/
- AWS SES 콘솔: https://console.aws.amazon.com/ses
- AWS SES 가격: https://aws.amazon.com/ses/pricing/
  - 첫 62,000통/월 무료 (EC2에서 발송 시)
  - 이후 $0.10 per 1,000통
