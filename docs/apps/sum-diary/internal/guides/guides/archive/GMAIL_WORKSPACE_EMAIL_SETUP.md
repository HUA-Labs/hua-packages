# Gmail Workspace 이메일 주소 생성 가이드

## 📅 작성일
2025-12-14

## 📧 생성할 이메일 주소 목록

### 필수 이메일 주소

1. **contact@hua.ai.kr** - 문의하기, 고객 지원
2. **noreply@hua.ai.kr** - 시스템 자동 발송 (회원가입, 알림 등)

### 권장 이메일 주소

3. **support@hua.ai.kr** - 기술 지원
4. **notifications@hua.ai.kr** - 알림 전용 (선택)

## 🔧 Gmail Workspace에서 그룹 이메일 생성 방법

### 1. contact@hua.ai.kr 그룹 생성

**단계별 가이드:**

1. **Google Admin Console 접속**
   - https://admin.google.com 접속
   - 관리자 계정으로 로그인

2. **그룹 생성**
   - 왼쪽 메뉴 → **그룹** 클릭
   - 상단 **그룹 만들기** 버튼 클릭

3. **그룹 정보 입력**
   ```
   그룹 이름: Contact Support
   그룹 이메일: contact@hua.ai.kr
   그룹 설명: 문의하기 및 고객 지원 이메일
   ```

4. **멤버 추가**
   - **멤버** 탭 → **멤버 추가**
   - 실제로 이메일을 받을 관리자 이메일 주소들 추가
   - 예: `admin1@hua.ai.kr`, `admin2@hua.ai.kr`

5. **설정**
   - **이메일 옵션**:
     - ✅ 외부에서 이메일 받기 허용
     - ✅ 멤버는 이메일 보내기 가능
   - **권한**:
     - 멤버: 이메일 보내기 가능
     - 관리자: 모든 권한

### 2. noreply@hua.ai.kr 그룹 생성

**단계별 가이드:**

1. **그룹 생성**
   - 그룹 이름: `No Reply`
   - 그룹 이메일: `noreply@hua.ai.kr`
   - 그룹 설명: `시스템 자동 발송 이메일`

2. **중요 설정**
   - **이메일 옵션**:
     - ❌ 외부에서 이메일 받기 비허용 (noreply이므로)
     - ✅ 멤버는 이메일 보내기 가능
   - **자동 응답**: 설정하지 않음

3. **멤버 추가 (선택사항)**
   - 시스템 이메일만 발송하므로 멤버는 없어도 됨
   - 또는 개발자 이메일 추가 (모니터링용)

**참고:** 
- 그룹으로 생성하는 것을 권장합니다 (일관성, 확장성)
- 앨리어스로도 가능하지만, 나중에 멤버 추가가 어려움

### 3. support@hua.ai.kr 그룹 생성 (선택사항)

**용도:** 기술 지원, 버그 리포트

**설정:**
- contact@hua.ai.kr과 동일한 방식으로 생성
- 멤버: 기술 지원팀 이메일 주소들

## 📋 체크리스트

### contact@hua.ai.kr
- [ ] 그룹 생성 완료
- [ ] 멤버 추가 완료
- [ ] 외부 이메일 받기 허용 설정
- [ ] 테스트: 외부에서 이메일 발송 후 받는지 확인

### noreply@hua.ai.kr
- [ ] 그룹 또는 앨리어스 생성 완료
- [ ] 외부 이메일 받기 비허용 설정 (noreply이므로)
- [ ] Resend/Nodemailer에서 발송 테스트

### support@hua.ai.kr (선택사항)
- [ ] 그룹 생성 완료
- [ ] 멤버 추가 완료

## 🔍 확인 방법

### 1. 그룹 이메일 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM pg_group WHERE email = 'contact@hua.ai.kr';
```

### 2. 이메일 발송 테스트
- 외부 이메일에서 `contact@hua.ai.kr`로 테스트 이메일 발송
- 관리자 받은편지함에서 확인

### 3. Resend 도메인 인증 (Resend 사용 시)
1. Resend Dashboard → Domains
2. `hua.ai.kr` 도메인 추가
3. DNS 레코드 추가 (Resend에서 제공하는 레코드)
4. 도메인 인증 완료 후 `noreply@hua.ai.kr` 사용 가능

## ⚠️ 주의사항

1. **noreply@hua.ai.kr**
   - 외부에서 이메일 받기 비허용 설정 필수
   - 자동 응답 설정하지 않음
   - 받은편지함 확인 불필요 (자동 발송 전용)

2. **contact@hua.ai.kr**
   - 외부에서 이메일 받기 허용 필수
   - 여러 관리자가 확인할 수 있도록 그룹 권장
   - 빠른 응답을 위한 알림 설정 권장

3. **도메인 인증 (Resend 사용 시)**
   - Resend에서 도메인 인증 필요
   - DNS 레코드 추가 필요 (SPF, DKIM 등)
   - 인증 완료까지 24-48시간 소요 가능

## 📝 환경 변수 설정

```env
# 이메일 주소
CONTACT_EMAIL=contact@hua.ai.kr
NOREPLY_EMAIL=noreply@hua.ai.kr
SUPPORT_EMAIL=support@hua.ai.kr  # 선택사항

# Resend 설정
RESEND_API_KEY=re_xxxxx

# 또는 Nodemailer 설정 (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@hua.ai.kr
SMTP_PASS=앱_비밀번호
```

## 🎯 다음 단계

1. ✅ Gmail Workspace에서 그룹 이메일 생성
2. ⏳ Resend 도메인 인증 (Resend 사용 시)
3. ⏳ 환경 변수 설정
4. ⏳ 이메일 전송 기능 구현
5. ⏳ 테스트
