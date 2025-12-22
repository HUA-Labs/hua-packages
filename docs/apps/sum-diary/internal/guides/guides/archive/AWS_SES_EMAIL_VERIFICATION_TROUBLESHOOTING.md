# AWS SES 이메일 인증 문제 해결 가이드

## 📅 작성일
2025-12-14

## 🔍 인증 메일이 오지 않는 경우

### 1. 그룹 이메일의 경우

Gmail Workspace 그룹 이메일(`contact@hua.ai.kr`)은 멤버의 개인 받은편지함으로 전달됩니다.

**확인 사항:**
- 그룹에 추가된 관리자 이메일의 받은편지함 확인
- 스팸 폴더 확인
- 그룹 설정에서 "외부에서 이메일 받기 허용" 확인

### 2. 가장 확실한 해결 방법: 도메인 인증 (권장)

**도메인을 인증하면 해당 도메인의 모든 이메일 주소를 사용할 수 있습니다!**

1. **AWS SES 콘솔 접속**
   - https://console.aws.amazon.com/ses
   - 리전: `ap-southeast-2` 선택

2. **도메인 인증**
   - Verified identities → **Create identity**
   - Identity type: **Domain** 선택
   - Domain name: `hua.ai.kr` 입력
   - **Create identity** 클릭

3. **DNS 레코드 추가**
   - AWS에서 제공하는 DNS 레코드를 복사
   - 도메인 DNS 관리 콘솔에 추가:
     - **TXT 레코드** (도메인 인증용)
     - **CNAME 레코드** (DKIM 서명용, 3개)
   - DNS 전파 대기 (보통 몇 분 ~ 몇 시간)

4. **인증 완료 확인**
   - AWS SES 콘솔에서 상태가 **Verified**로 변경되면 완료
   - 이제 `@hua.ai.kr` 도메인의 모든 이메일 주소 사용 가능!

### 3. 대안: 개인 이메일로 임시 인증

**그룹 이메일로 인증이 안 될 경우:**

1. **개인 이메일로 인증**
   - Create identity → Email address
   - 개인 이메일 주소 입력 (예: `echonet.ais@gmail.com`)
   - 인증 메일 확인 및 인증 완료

2. **그룹 이메일 사용**
   - 개인 이메일 인증 완료 후
   - 코드에서는 여전히 `contact@hua.ai.kr` 사용 가능
   - 단, AWS SES에서는 개인 이메일을 발신 주소로 사용해야 함
   - 또는 도메인 인증으로 전환 권장

### 4. 그룹 설정 확인

**Google Admin Console에서:**
1. 그룹 → `contact@hua.ai.kr` 선택
2. 이메일 옵션 확인:
   - ✅ 외부에서 이메일 받기 허용
   - ✅ 멤버는 이메일 보내기 가능

### 5. AWS SES에서 재발송

1. AWS SES 콘솔 → Verified identities
2. `contact@hua.ai.kr` 선택
3. "Send verification email" 버튼 클릭
4. 그룹 멤버의 받은편지함 확인

### 6. 스팸 필터 확인

- Gmail Workspace의 스팸 필터가 AWS SES 메일을 차단할 수 있음
- 그룹 멤버의 스팸 폴더 확인
- 필요시 AWS SES 발신 주소를 허용 목록에 추가

## ✅ 인증 완료 확인

AWS SES 콘솔에서:
- Verified identities → `contact@hua.ai.kr`
- 상태가 **Verified**로 변경되면 완료

## 🎯 권장 방법: 도메인 인증

**가장 확실하고 유연한 방법은 도메인 인증입니다:**

### 장점
- ✅ `@hua.ai.kr` 도메인의 모든 이메일 주소 자동 인증
- ✅ 개별 이메일 주소 인증 불필요
- ✅ 그룹 이메일 문제 해결
- ✅ 향후 추가 이메일 주소도 자동 사용 가능

### 단점
- ⚠️ DNS 레코드 추가 필요 (한 번만)
- ⚠️ DNS 전파 시간 소요 (보통 몇 분 ~ 몇 시간)

### DNS 레코드 추가 방법

1. **AWS SES에서 제공하는 레코드 확인**
   - Verified identities → `hua.ai.kr` 선택
   - DNS 레코드 섹션에서 레코드 확인

2. **도메인 DNS에 추가**
   - 도메인 관리 콘솔 접속 (예: 가비아, Route53 등)
   - DNS 레코드 추가:
     - **TXT 레코드**: 도메인 인증용
     - **CNAME 레코드**: DKIM 서명용 (3개)

3. **전파 확인**
   - `nslookup` 또는 온라인 DNS 체크 도구로 확인
   - AWS SES 콘솔에서 자동으로 확인됨

## ⚠️ 중요: 리전 확인

**AWS SES 인증은 리전별로 관리됩니다!**

도메인 인증이 되어 있어도 다른 리전에서는 인증되지 않은 것으로 보일 수 있습니다.

### 리전 확인 방법

1. **현재 사용 중인 리전 확인**
   - Doppler 환경 변수: `AWS_SES_REGION=ap-southeast-2`
   - 또는 코드에서 사용하는 리전 확인

2. **AWS SES 콘솔에서 리전별 인증 확인**
   - AWS SES 콘솔 접속
   - 우측 상단에서 리전 선택
   - 각 리전에서 Verified identities 확인:
     - `ap-southeast-2` (현재 사용 중)
     - `ap-northeast-2` (서울)
     - `us-east-1` (기본 리전)

3. **리전별로 도메인 인증 필요**
   - 사용할 모든 리전에서 도메인 인증 필요
   - 또는 하나의 리전에서만 사용하도록 통일

### 해결 방법

**옵션 1: 사용 중인 리전에서 도메인 인증**
- `ap-southeast-2` 리전 선택
- `hua.ai.kr` 도메인 인증 확인
- 인증되지 않았다면 DNS 레코드 추가 (동일한 레코드 사용 가능)

**옵션 2: 리전 변경**
- Doppler에서 `AWS_SES_REGION`을 도메인이 인증된 리전으로 변경
- 예: `ap-northeast-2` 또는 `us-east-1`

## 📝 참고

- AWS SES 인증 메일은 보통 즉시 도착함
- 그룹 이메일의 경우 멤버의 개인 받은편지함으로 전달되지만, AWS SES 인증 메일은 전달되지 않을 수 있음
- **도메인 인증이 가장 확실한 방법입니다**
- **인증은 리전별로 관리되므로 사용 중인 리전에서 인증되어 있어야 합니다!**
