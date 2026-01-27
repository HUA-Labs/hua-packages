# 🗂️ 숨다 DB 스키마 v0.3 — 26 테이블 (필드 설명)
> 주의: 자료형/제약은 추후 확정. 아래는 **각 컬럼에 들어갈 데이터 의미(설명)** 중심.
> 스키마 분리: `public.*`(서비스) / `admin.*`(관리)

---

## 0) 공통 원칙
- 원문은 암호화 저장(앱 레이어), 결과는 DB 캐싱 후 서빙.
- 모델/프롬프트/룰셋 버전 기록 필수.
- 운영/윤리 정책은 jsonb 기반 유연성 확보.

---

## 1) 서비스 스키마 (public) 

# 🗂️ users
### 테이블 목적
- 서비스 이용자의 기본 계정 정보를 저장하는 핵심 테이블
- 다른 데이터의 기준이 되는 최상위 식별자 이다.
  (구독, 결제,  서비스 알림, 유저 일기 , 이벤트 내역등)
- 사용자 인증, 사용자 상태 관리, 알림 전송, 숨다 에서의 유저 서비스, 이용, 보안, 계정등 

# 1. users

| name          | description     | 비고                              |
| ------------- | --------------- | ------------------------------- |
| id            | 사용자 고유 식별자      | 소셜계정 nullable                   |
| email         | 로그인/공지 송신용 이메일  | 소셜계정 nullable                   |
| password_hash | 해시된 비밀번호        |                                 |
| nickname      | 앱 내 표시명         |                                 |
| profile_image | 프로필 이미지 경로/URL. |                                 |
| state         | 계정 상태           | active/inactive/resigned/banned |
| created_at    | 생성 시점           |                                 |
| updated_at    | 갱신 시점           |                                 |

### 📌 1:N 관계 (users → 관련 테이블)

- **`user_id` → `subscriptions.user_id`**  
    구독/멤버십 정보 관리.
    - 유저의 현재 구독 상태(활성/만료), 구독 등급, 시작일·종료일 기록.
    - 결제 주기, 자동 갱신 여부 등 구독 서비스 운영에 활용.

- **`user_id` → `payments.user_id`**  
    결제 내역 추적.
    - 구독/이벤트/포인트 구매 등 유저 결제 이력 저장.
    - 결제 실패, 환불, 할인 내역까지 포함 가능.
    
- **`user_id` → `notifications.user_id`**  
    알림 발송 및 수신 로그 관리.
    - 푸시 알림, 이메일, 앱 내 알림 등 발송 이력 저장.
    - 발송 시간, 읽음 여부, 클릭 여부를 기반으로 알림 효과 분석 가능.
    
- **`user_id` → `user_points_ledger.user_id`**  
    포인트 적립·사용 내역 관리.
    - 포인트 획득 사유(이벤트, 활동 보상)와 사용 내역(교환, 차감) 기록.
    - 누적·소멸 포인트 집계로 리워드 프로그램 운영 가능.
    
- **`user_id` → `reports.user_id`**  
    숨다 이용에 대한 유저 리포트(행동 분석).
    - 감점 점수, 대표 키워드, 감정 파형, 이용 빈도 등 AI 분석 결과 저장.
    - 서비스 이용 습관·패턴 분석, 이상 행동 탐지, 개인화 추천 근거 데이터로 활용.

- **`user_id` → `event_attendance.user_id`**  
    유저의 이벤트 참여 내역 관리.
    - 출석 기록, 참여한 이벤트명, 지급된 보상 코드, 인증 내역 저장.
    - 이벤트 참여율, 리워드 발급 내역 추적 가능.

- **`user_id` → `diary_entries.user_id`**  
    유저 작성 일기 데이터 관리.
    - 작성 날짜, 내용, 첨부 이미지·파일, 공개 여부 저장.
    
    - 감정 분석, 일기 작성 빈도, 주제별 통계 등 다양한 분석 가능.


조인 활용 
- users + subscriptions + payments --> 유저별 결제 패턴, 구독 유지율 분석

---- 

# 🗂️ diary_entries(원문 암호화)

### 테이블 목적
- 사용자가 숨다에서 작성한 일기 데이터를 저장하는 핵심 테이블
- 개인 사적인 기록임으로 원문은 암호화 형태로 안전하게 저장한다
- 감정 분석, 유저의 사용 습관 분석, 유저 각각의 리포트 생성, 서비스에 필요한 원천 데이터
# 2. diary_entries  테이블(원문 암호화)
| name        | description  | 비고  |
| ----------- | ------------ | --- |
| id          | 일기 식별자       |     |
| user_id     | 작성자 users.id |     |
| title       | 일기 제목(선택)    |     |
| content_enc | 암호화된 원문 바이트  |     |
| created_at  | 생성 시각        |     |
| updated_at  | 갱신 시각        |     |

### 조인 으로 활용 가능한 분석 
- **보상 운영 분석**  
    `diary_entries` + `user_points_ledger`  
    → 일기 작성 보상 지급 현황, 누적 포인트, 소멸 포인트 규모 분석.
    
- **알림 효과 분석**  
    `diary_entries` + `notifications`  
    → 일기 작성 리마인더 발송 대비 실제 작성 전환율 측정.



--- 
# 🗂️ analysis_results (GPT 분석 결과)

### 테이블 목적
- 사용자가 작성한 일기(diary_entries)를 GPT 사용하여 도출된 분석 결과를 저장 하는 테이블
- 유저가 작성한 원문 일기(텍스트) 내용을 GPT를 통해 도출된 감정, 흐름, 해석, 질문등 분석 데이터를 별도로 관리하여 서비스(리포트, 유저의 상태등) 기능에 활용 한다
### 3. analysis_results (GPT 분석 결과)
| name                | description        | 비고                                                                                                       |
| ------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| id                  | 분석 레코드 식별자         | 일기 1:N 가능                                                                                                |
| diary_id            | 대상 일기 id           |                                                                                                          |
| summary             | “오늘의 장면” 축약 요약 텍스트 |                                                                                                          |
| emotion_flow        | 감정 흐름 시퀀스          | json 배열; 단계/전환 설명 포함                                                                                     |
| reflection_question | 사용자 자기성찰 질문 1개     |                                                                                                          |
| interpretation      | 감응 해석 텍스트          | 친절한 설명문                                                                                                  |
| metadata            | 운영용 메타             | json: {tier_a, tier_m, slip 상태, ethics 태그, model_name, model_version, prompt_version, tokens, latency 등} |
| created_at          | 생성 시각              |                                                                                                          |


### 📌 1:N 관계 (analysis_results → 관련 테이블)

- **`analysis_results.diary_id` → `diary_entries.id`**
    - 하나의 일기에 대해 여러 분석 결과를 가질 수 있음 (1:N).
    - 예: GPT 분석 버전이 다르거나, 다른 분석 모듈 결과를 병렬로 저장 가능.
- **`analysis_results.user_id` (없다면 diary_entries.user_id 통해 간접 연계)**
    - 해당 분석 결과의 사용자 식별.
    - 리포트(`reports.user_id`)와 연결해 사용자 단위로 분석 집계 가능.


### 조인 으로 활용 가능한 분석 

**일기 기반 분석 연결**  
`diary_entries` + `analysis_results`  
→ 일기 원문(암호화)과 GPT 요약/감정 흐름을 매칭하여 분석 보고서 생성.

**사용자 리포트 생성**  
`analysis_results` + `reports` (user_id 기준)  
→ 기간별 리포트(summary, 감정 파형, 대표 질문 등)에 GPT 분석 결과를 반영.


### metadata 컬럼 설명
metadata 컬럼에서의  tier,slip, ehics등등... 내용 설멍

- tier_a  센티멘달 점수: 글의 긍정/부정 감정 강도를 수치화(0.1~4.0)
  1.0은 평볌, 4.0은 감정 폭발 상태
- tier_m: 티어 몰입 척도: 대화/글의 몰입도와 복잡도 수준(0.1~4.0) 높을수록 감정 몰입 강함
- slip 슬립 상태 여부: 일정 티어 이상 시 서비스 일시 중단(제한 처리 true/false)
- ethics 윤리태그: 폭력/성희롱/불법 등 위험 콘텐츠 여부를 태그, 즉시 차단 로직 판단에 활용
- tokens: 분석 요청시 사용된 토큰 수


### **백엔드 처리 시 유의사항**

- `metadata`는 **사용자 비공개**이며, 절대 API 응답으로 그대로 반환하지 않음.
- 슬립·차단 로직은 실시간 처리 또는 주기적 백그라운드 분석 프로세스에서 `metadata` 값을 참조.
- JSON 구조 변경 시, 버전 관리(`prompt_version`)를 통해 하위 호환성 유지 필요.

--- 

# 🗂️ reports (기간 집계)


### 데이블 목적
- 사용자의 활동·감정 데이터를 **기간 단위(일/주/월/연)**로 집계하여 저장하는 테이블.
- 주기적으로 생성되어 평균 감정 점수, 감정 분포, 주요 키워드, 대표 문장, 감정 파형, 이용 빈도 등의 분석 결과를 JSON(`summary`) 형태로 보관.
- 개인 리포트 화면, 관리자 통계, 경고/슬립 정책 판단 근거 데이터로 활용.


### 4. reports (기간 집계)
| name         | description | 비고                                                   |
| ------------ | ----------- | ---------------------------------------------------- |
| id           | 리포트 식별자     |                                                      |
| user_id      | 대상 사용자      |                                                      |
| period_type  | 집계 주기 유형    | daily / weekly / monthly / yearly                    |
| period_start | 집계 기간 시작    | 포함/미포함 규칙 일관화 필요, 포함(inclusive)                      |
| period_end   | 집계 기간 종료    | 포함/미포함 규칙 일관화 필요, 미포함(exclusive)                     |
| summary      | 집계 결과(json) | 평균/최대/최소 감정 점수, 감정 비율, 상위 키워드, 대표 문장, 파형 요약, 이용 빈도 등 |
| created_at   | 생성 시각       |                                                      |


### 📌 1:N 관계 (reports → 관련 테이블)

- **`reports.user_id` → `diary_entries.user_id`** _(간접 연계)_
	- 해당 기간(`period_start`~`period_end`)에 작성된 일기 목록을 가져와 집계에 사용.


### 조인으로 활용 가능한 분석 

- **일기 기반 집계 검증**  `reports` + `diary_entries`  → 리포트 기간 동안 작성된 일기 수, 감정 분포 검증.
- **AI 분석 결과 통합**  `reports` + `analysis_results` (user_id + 기간 조건)→감정 파형, 대표 문장, 상위 키워드 등 AI 기반 분석 요소를 리포트에 반영 

### 개선 포인트

- **기간 정의를 명문화**
    - **포함/미포함 규칙을 한 줄로 고정**:  
        예) `period_start`는 **포함(inclusive)**, `period_end`는 **미포함(exclusive)** 으로 문서화.
    
- **기간 타입별 변환 함수 제공**
    - `daily(user_id, date)` → `start=00:00, end=다음날 00:00`
    - `weekly(user_id, date)` → 주 시작 요일 고정 후 `start=월 00:00, end=다음주 월 00:00`
    - `monthly(user_id, date)` → `start=YYYY-MM-01 00:00, end=다음달 1일 00:00`
    
- **DB 차원에서 제약 추가**
    - `CHECK (period_start < period_end)`
    - 기간 겹치는 리포트는 UNIQUE INDEX(`user_id, period_type, period_start`)로 방지
    
- **테스트 케이스 준비**
    - 하루/주/월 경계 날짜(12월 31일 → 1월 1일, 윤년 2월 29일 등)까지 테스트.

### 💡 서비스 활용 시나리오

1. **개인 주간/월간 리포트 생성**

    - 사용자에게 활동 요약과 감정 변화 그래프 제공.
        
2. **위험 신호 감지**
    
    - 특정 기간 감정 점수가 비정상적으로 높거나 낮을 경우 슬립·경고 정책 적용.
        
3. **관리자 대시보드**
    
    - 기간별 사용자 감정 추세와 이용 패턴 분석.
        
4. **목표 추적 기능**
    
    - 사용자가 목표로 설정한 감정 상태 변화 여부를 주기적으로 피드백.
--- 
# 🗂️ subscriptions (구독 정보)


### 테이블 목적
- 숨다 사용자의 숨다 서비스, 구독/멤버십 정보 저장하는 테이블
- 어떤 요금제 사용 중인지, 구독 상태, 시작, 종료일 관리하여 결제 시스템과 서비스 접근 제어 활용 테이블
- 구독 해지, 갱신, 만료 처리 및 결제 이력과 직접 연계되는 핵심 데이터
### 5. subscriptions

| name            | description     | 비고                                                                 |
| ----------------| --------------- | -------------------------------------------------------------------- |
| id              | 구독 식별자       | PK                                                                  |
| user_id         | 구독자 id        | UNIQUE, FK → users.user_id                                          |
| plan            | 적용 플랜 코드     | FK → plans.code                                                     |
| status          | 구독 상태        | 기본 'active', CHECK (active / canceled / past_due / trial)         |
| start_date      | 구독 시작일       |                                                                     |
| end_date        | 구독 종료일       | NULL이면 활성 구독 중                                                  |
| created_at      | 생성 시각        | 기본 now()                                                          |
| provider        | 결제 프로바이더    | 기본 'toss', UNIQUE                                                 |
| customer_key    | 고객 키          | 토스페이먼츠 발급                                                    |
| billing_key     | 빌링 키          | 토스페이먼츠 발급, UNIQUE                                           |
| next_billing_at | 다음 결제 시점     | 상태가 active / trial일 때 유효                                          |
| last_billed_at  | 마지막 결제 시점    |                                                                     |
| cancel_at       | 취소 시점        |                                                                     |
| cancel_reason   | 취소 사유        |                                                                     |
| trial_end       | 체험 종료 시점     |                                                                     |
| quantity        | 구독 수량        | 기본 1                                                              |
| price_override  | 가격 오버라이드    | 할인/프로모션용                                                       |
| currency        | 통화 코드        | 기본 'KRW', ISO 4217                                                |

### 📌 1:N 관계 (subscriptions → 관련 테이블) 제안사항임
(테이블간 관계에 대한 문제가 있는 부분들 이며 추후 변경 예정)
- **`subscriptions.id` → `payments.subscription_id`** _(설계에 존재할 경우)_
    - 해당 구독에 대한 결제 내역 연결.
    - 결제 금액, 결제일, 결제 상태 추적 가능.
- **`subscriptions.plan` → `plans.code`** _(외부 참조 테이블)_
    - 요금제 상세 정보와 연결.
    - 요금제명, 가격, 제공 서비스 범위 확인 가능.


### 조인으로 활용 가능한 분석 
- 구독 유지율 분석 subscription + users →사용자 가입일 대비 구독 시작일,유지 기간, 갱신 여부 분석
- 결제 패턴 분석 subscription + payments →구독 갱신 주기, 결제 실패율, 할인 적용률 통계 생성
- 요금제별 매출 분석 subscriptions + plans + payments →요금제별 매출 비중, 구독자 수, 평균 결제 금액 집계


### 💡 서비스 활용 시나리오
 -  **서비스 접근 제어**
    
    - 구독 상태(`active`/`canceled`/`past_due`)에 따라 서비스 기능 접근 권한 제어.
        
- **갱신 알림 발송**
    
    - `end_date` 임박 시 자동 갱신 안내 또는 해지 안내 발송.
        
- **요금제 업그레이드/다운그레이드**
    
    - 현재 `plan`을 기반으로 상위·하위 요금제 변경 처리.
        
- **매출 리포트 생성**
    
    - 기간별 신규 구독자 수, 구독 유지율, 요금제별 매출 추이 리포트 제공.

--- 
# 🗂️ payments (결제 내역)

### 테이블 목적
- 사용자의 결제 내역, 수단, 카드사, 통화 코드등을 저장하는 테이블
- 숨다 유저가 사용한 결제 금액, 결제 수단, PG사 트랜잭션 ID 기록하여 
  숨다의 구독, 이벤트, 결제, 매출 추적에 사용
### 6. payments
| name            | description   | 비고                                             |
| --------------- | ------------- | ---------------------------------------------- |
| id              | 결제 식별자        | 트랜잭션 단위, PK                                    |
| user_id         | 결제 사용자        | FK → users.user_id                             |
| amount          | 결제 금액         |                                                |
| currency        | 통화 코드         | ISO 4217, 예: KRW                               |
| method          | 결제 수단         | 카드/간편결제 등                                      |
| provider        | 결제 프로바이더      |                                                |
| provider_tx_id  | 외부 결제 트랜잭션 ID | 대사/중복 방지 위해 UNIQUE 권장                          |
| created_at      | 결제 발생 시각      |                                                |
| order_id        | 주문 아이디        | 외부/내부 주문 식별자                                   |
| status          | 결제 상태         | pending/approved/failed/refunded 등(ENUM/체크 권장) |
| approved_at     | 결제 승인 시점      |                                                |
| requested_at    | 결제 요청 시점      |                                                |
| receipt_url     | 영수증 URL       |                                                |
| failure_code    | 실패 코드         |                                                |
| failure_message | 실패 메시지        |                                                |
| method_detail   | 결제 수단 상세 데이터  | JSON 메타(당시 카드/간편결제 스냅샷)                        |
| refunded_amount | 환불 금액         | 기본 0                                           |
| subscription_id | 구독 ID         | FK → subscriptions (user_id와 함께 참조 시 일관성 ↑)    |
| billing_key     | 결제 빌링키        | 정기결제/재결제용 토큰                                   |

### 📌 1:N 관계 (payments → 관련 테이블)
- subscriptions 테이블과의 관계를 구상 하고 있으며 
  subscriptions 테이블 설명에 테이블 관계에 대한 설명으로
  payments 1:N 관계 설명은 생략


### 1대1 관계 제안
payments.provider_tx_id → 외부 결제사 트랜잭션 식별자이기 때문에 1:1관계 테이블 분리 가능성 




--- 
# 🗂️ notifications (알림 내역)

### 테이블 목적
- 사용자 또는 전체 유저에게 발송되는 알림 내역을 저장하는 테이블(숨다 유저의 알림 발솜/읽음 로그 저장 동적 테이블)
- 공지사항, 숨다 서비스 공지, 숨다 이벤트, 오류 사항등 숨다 서비스에서 발생하는 모든
  이벤트 알림 관리
- 공지 읽음 여부 등으로 사용자 반응을 분석할 수 있다.


###  7. notifications (알림/공지 노출)
| name        | description     | 비고                                  |
| ----------- | --------------- | ------------------------------------- |
| id          | 알림 식별자        |                                       |
| user_id     | 대상 사용자        | NULL이면 전체 공지                       |
| type        | 알림 분류         | 공지 / 시스템 / 이벤트 등                  |
| title       | 알림 제목         |                                       |
| message     | 알림 본문         |                                       |
| read        | 읽음 여부         |                                       |
| visible_from| 노출 시작 시각      |                                       |
| visible_to  | 노출 종료 시각      |                                       |
| created_at  | 생성 시각         |                                       |


### 📌 1:N 관계 (notifications → 관련 테이블)
- **`notifications.user_id` → `users.id`**
    - 특정 사용자에게만 발송되는 알림과 연결.
     ex) 사용자 100명 한정 이벤트건에 대한 당첨 알림등
        
- **간접 연계 가능성**
    - `notifications` + `event_attendance` → 이벤트 참여 관련 알림 효과 분석.
     ex) 출석 이벤트 10P 지급 메시지


### 조인으로 활용 가능한 분석 

- **알림 반응률 분석**  
    `users` + `notifications`  
    → 알림 발송 건수 대비 읽음(`read = true`) 비율, 클릭 후 행동(로그인, 결제 등) 추적.
    
- **이벤트 참여율 분석**  
    `notifications` + `event_attendance`  
    → 이벤트 초대 알림을 받은 사용자 중 실제 참여율 분석.
    
    
- **공지 효율성 검증**  
    `notifications`  
    → 알림 타입(`type`)별(공지/시스템/이벤트) 읽음률 비교.
	    (이벤트별 읽음률 분석, 시스템 업데이트, 숨다 서비스 읽음률 분석)


### 💡 서비스 활용 시나리오

-  **공지사항 발송**
    
    - `type = 'notice'` : 전체 사용자 대상 서비스 점검 안내, 정책 변경 공지.
        
-  **시스템 메시지**
    
    - `type = 'system'` : 계정 상태 변경, 보안 알림(비밀번호 변경, 로그인 감지).
        
-  **이벤트 안내**
    
    - `type = 'event'` : 출석 이벤트, 보상 지급 안내, 참여 코드 전달.
        
-  **읽음 추적**
    
    - `read` 필드를 통해 개별 사용자의 알림 확인 여부를 추적, 리마인더 발송 여부 결정.
        
-  **노출 제어**
    
    - `visible_from` / `visible_to` 필드로 알림 표시 기간을 제한하여 유효기간 지난 알림 자동 비활성화.

--- 

### 

# 🗂️ plans (요금제 정의)

### 테이블 목적

- 서비스에서 제공하는 **구독/멤버십 요금제**를 정의하는 테이블.
- 코드, 표시명, 가격, 통화, 기능 세트(features) 등을 관리하여 **구독 결제 정책의 기준 데이터** 역할 수행.
- 가격 변경, 기능 업데이트, 판매 여부(is_active) 제어를 통해 요금제 운영을 유연하게 관리.


### 8. plans (요금제 정의)
| name            | description   | 비고                                                 |
| --------------- | ------------- | -------------------------------------------------- |
| id              | 결제 식별자        | UUID, PK                                           |
| user_id         | 결제 사용자        | FK → users.user_id                                 |
| amount          | 결제 금액         |                                                    |
| currency        | 통화 코드         | ISO 4217, 기본 'KRW'                                 |
| method          | 결제 수단         | 카드 / 간편결제 등                                        |
| provider        | 결제 프로바이더      |                                                    |
| provider_tx_id  | 외부 결제 트랜잭션 ID | UNIQUE 권장                                          |
| created_at      | 결제 발생 시각      | 기본 now()                                           |
| order_id        | 주문 아이디        | 외부/내부 주문 식별자                                       |
| status          | 결제 상태         | ENUM 권장 (pending / approved / failed / refunded 등) |
| approved_at     | 결제 승인 시점      |                                                    |
| requested_at    | 결제 요청 시점      |                                                    |
| receipt_url     | 영수증 URL       |                                                    |
| failure_code    | 실패 코드         |                                                    |
| failure_message | 실패 메시지        |                                                    |
| method_detail   | 결제 수단 상세 데이터  | ,                                                  |
| refunded_amount | 환불 금액         |                                                    |
| subscription_id | 구독 ID         | FK → subscriptions.id + subscriptions.user_id      |
| billing_key     | 결제 빌링키        | 정기결제/재결제용                                          |

### 📌 1:N 관계 (plans → 관련 테이블)

**`plans.code` → `subscriptions.plan`**
- 사용자가 구독 중인 요금제와 연결.
- 가격·기능 변경 시, 해당 요금제를 사용하는 모든 구독에 영향.

`plans` →  `payments` (subscriptions를 통해 간접 연결)  
- 결제 내역을 요금제별로 집계 가능.


### 조인 활용 분석
- **구독 유지율 분석**  
	`subscriptions` + `users`  → 사용자 가입일 대비 구독 시작일, 유지 기간, 갱신 여부 분석.

### 💡 서비스 활용 시나리오

1. **요금제 관리 화면**
    - 관리자 페이지에서 요금제 생성, 가격·기능 업데이트, 판매 중지(is_active=false) 처리.
    
2. **구독 신청**
    - 사용자가 선택한 `plan.code`를 기반으로 `subscriptions` 생성.
    
3. **결제 금액 계산**
    - `plans.price` 값을 사용하여 결제 금액 산정.
        
4. **기능 제한**
    - `features` JSONB의 설정값에 따라 특정 기능 허용/차단.
        
5. **프로모션 적용**
    - 요금제별 할인 정책, 무료 체험 여부를 동적으로 제어.

--- 

# 🗂️ event_attendance (이벤트 출석/참여 내역)

### 테이블 목적

- 사용자의 **이벤트 출석 및 참여 기록**을 관리하는 테이블.
- 출석 일자, 연속 출석 횟수(`streak`), 보상 코드(`reward_code`) 등을 저장하여 출석 이벤트·미션 이벤트 운영에 활용.
- 사용자 리워드 지급, 이벤트 참여율 분석, 서비스 내 참여도 지표 산출의 근거 데이터.

### 9. event_attendance (출석)
| name        | description         | 비고                                  |
| ----------- | ------------------- | ------------------------------------- |
| id          | 출석 레코드 식별자      | PK                                    |
| user_id     | 사용자 id            | FK → users.id                         |
| date        | 출석 일자             | 로컬 기준(Asia/Seoul)                  |
| streak      | 연속 출석 일수 스냅샷   | 해당 시점까지 카운트                    |
| reward_code | 보상 코드             | 해당 일자 지급된 보상 있으면 기록          |
| created_at  | 생성 시각             |                                       |


### 📌 1:N 관계 (event_attendance → 관련 테이블)

- **`event_attendance.user_id` → `users.id`**
	- 이벤트에 참여한 사용자 정보 참조.
	- 프로필, 구독 상태, 결제 내역 등과 연계 가능.

- `event_attendance` + `subscriptions`  
	-  특정 요금제 사용자들의 이벤트 참여율 비교.





### 조인 활용 분석 예시

- **참여율 분석**  
    `users` + `event_attendance`  
    → 유저 그룹별 출석/참여 비율, 신규 vs 기존 사용자 비교.
    
- **알림 효과 분석**  
    `event_attendance` + `notifications`  
    → 이벤트 알림을 받은 사용자 중 실제 출석한 비율.
    
- **구독/매출 연계 분석**  
    `subscriptions` + `payments` + `event_attendance`  
    → 이벤트 참여자가 구독 유지율, 결제 금액 측면에서 더 높은지 비교.
    
- **보상 운영 분석**  
    `event_attendance` (reward_code)  
    → 지급된 보상 코드별 사용 현황, 리워드 회수율 추적.
--- 

# 🗂️ user_points_ledger (포인트 원장)

### 테이블 목적
- 숨다 사용자의 포인트 변화(적립/차감) 기록 테이블
- 거래 발생 원인(이벤트 참여, 보상 지급, 결제, 관리자 조정, 할인 적용등) 거래 후 잔액 등


### 10. user_points_ledger (포인트 원장)
| name          | description        | 비고                                          |
| ------------- | ------------------ | --------------------------------------------- |
| id            | 포인트 트랜잭션 식별자 | PK                                            |
| user_id       | 대상 사용자          | FK → users.id                                 |
| delta         | 증감 포인트          | + / - 값                                      |
| reason        | 사유               | 출석 / 이벤트 / 보상 / 관리자 조정 등             |
| ref_type      | 관련 객체 유형        | 이벤트 / 출석 / 결제 등                        |
| ref_id        | 관련 객체 식별자      | 해당 객체 PK                                   |
| balance_after | 적용 후 잔액 스냅샷    | 누적 결과를 저장해 조회 성능 최적화               |
| created_at    | 기록 시각           |                                               |


### 📌 1:N 관계 (user_points_ledger → 관련 테이블)

**`user_points_ledger.ref_type` + `ref_id`** _(폴리모픽 참조)_
- 이벤트 참여(`event_attendance`)
- 결제(`payments`)
- 일기 작성(`diary_entries`) 등 다양한 트랜잭션과 연결 가능.
- 동일 구조로 여러 테이블 참조 가능 → 유연한 설계.





###  💡 서비스 활용 시나리오

- **리워드 프로그램 운영**
    - 출석/이벤트 참여 시 `delta > 0` 기록, 포인트 적립.

- **포인트 결제 처리**
    - 결제 시 `delta < 0` 기록, 결제 금액 일부 또는 전부를 포인트로 차감.
        
- **관리자 조정**
    - 고객센터·운영팀이 필요 시 수동 적립/차감 처리.
        
- **감사/추적 기능**
    - 모든 거래 내역을 `balance_after`와 함께 기록하여 잔액 오류, 중복 지급 등 문제 추적.
        
- **만료 처리**
    - 소멸 정책 적용 시 음수 차감 거래 생성.


---
# 🗂️ announcements (공지/업데이트)
### 테이블 목적

- 서비스의 **공지/업데이트/이벤트 안내문**을 저장하는 테이블.
- 제목·본문·태그·게시/만료 시각을 관리해 **앱 내 공지 목록/상세 화면**과 관리자 공지 발행 플로우에 사용.
- 사용자별 알림 발송과는 분리된 **콘텐츠 원본 저장소** 역할.


- 비교적 존재감이 덜한 테이블임으로 (`notifications` 테이블과 1:N관계 설정 제안)

### notifications ↔ announcements 테이블간 관계제안(1:N)
하나의 공지가 여러 알림에 연결
- **관계 유형**: 1:N

- 활용
	- 1개의 공지(notifications)를 여러 개의 알림(announcements)와 연결 가능
	  (같은 공지를 등급별 회원의 세그먼트에 맞춰 각각 발송)

- 장점
	- 숨다 유료 및 무료 고객별, 무료 고객 등 그룹별 세그먼트 마케팅 가능
	- 서비스/이벤트 공지의 읾음률, 반응률 분석 시 '같은 공지'로 묶어 집계 가능


### 11. announcements (공지/업데이트)
| name         | description | 비고                           |
| ------------ | ----------- | ---------------------------- |
| id           | 공지 식별자      | PK                           |
| title        | 제목          |                              |
| body         | 본문          | 마크다운/리치텍스트 가능                |
| tags         | 태그          | 배열(앱업데이트/이벤트 등), TEXT[], GIN |
| published_at | 게시 시각       |                              |
| expires_at   | 만료 시각       | 만료 없으면 NULL, 시작 포함 종료 미포함    |
| created_at   | 생성 시각       |                              |
| updated_at   | 업데이트 시점     |                              |
| deleted_at   | 삭제 시점       | 소프트 딜리트                      |


### 📌 1:N 관계 (연계)
- 직접적인 FK 관계 없음
	- 스키마상 announcements는 다른 테이블과 연결되지 않는 테이블
	- 콘텐츠, 이벤트 등 발송/노출은 notifications 테이블로 처리




### 💡 서비스 활용 시나리오

1. **공지 목록/상세 화면**
    - `published_at ≤ now < COALESCE(expires_at, ∞)` 조건으로 노출.
        
2. **공지 고정(핀)·최근 공지 표시**
    - 최신 `published_at` 기준 상단 노출, 태그로 카테고리 필터.
        
3. **브로드캐스트 알림 발송**
    - 공지 등록 시 `notifications(user_id=NULL, type='notice')`로 전체 알림(스키마상 직접 FK는 없음).
        
4. **만료 자동 비노출**
    - `expires_at` 지난 공지는 자동 숨김.
        
5. **검색/필터**
    - `title/body` 텍스트 검색 + `tags` JSONB 포함 조건으로 필터.

--- 
# 🗂️ support_faq (고객지원 FAQ)

### 테이블 목적
- 서비스 내 고객지원 화면에 표시되는 자주 묻는 질문FAQ 데이터 저장
- 문의 카테고리 별 질문,작성, 답변 등록한다
- 숨다 서비스에 필요한 질문, 문제 사항, 개선, 요구 등 미리 안내하여 CS 부담 감소시키고
  사용자 경험(UX) 향상 기여


### support_faq 테이블은 독립 테이블이다.
- 현재까진 다른 테이블과 FK로 연결 및 접점이 없는 테이블임으로 상세 설명 생략

### 12. support_faq (FAQ)
| name       | description     | 비고                  |
|------------|-----------------|-----------------------|
| id         | 항목 식별자        | PK                    |
| category   | 카테고리          |                       |
| question   | 질문 텍스트        |                       |
| answer     | 답변 텍스트        |                       |
| order_no   | 정렬 우선순위       | 작은 숫자일수록 우선   |
| is_active  | 노출 여부          |                       |
| created_at | 생성 시각          |                       |



### 예시
- 숨다 서비스의 사용자 화면 예시
	- Q: FDS 시스템 발생
	- A: 고객센터 문의 
	


---
## 2) 관리 스키마 (admin)



# 🗂️ admin_users (운영자 계정)
### 테이블 목적
- 서비스 운영을 위한 **관리자(Admin) 계정 정보** 저장 테이블.
- **권한 제어**와 **로그인 인증**에 사용.
- 고객 관리, 서비스 운영, 이벤트, 보안등 제어 - 
- role 값에 따라 접근 가능한 기능 범위 제한하여 보안 및 운영 효율성 확보


### 13. admins (운영자)
| name          | description      | 비고                                   |
|---------------|------------------|----------------------------------------|
| id            | 운영자 식별자       | PK                                     |
| email         | 운영자 이메일       | 로그인 계정, UNIQUE 권장                |
| password_hash | 해시된 패스워드      |                                        |
| role          | 권한              | operator / manager / admin (ENUM 권장) |
| created_at    | 생성 시각          |                                        |


### 📌 1:N 관계 (admin_users → 관련 테이블)

- **`admin_users.admin_id` → `content_moderation_logs.admin_id`**
	- 운영자가 수행한 콘텐츠 조치(삭제, 차단, 복원 등)를 기록.
    - 어떤 운영자가 어떤 사유로 조치했는지 추적 가능.
    
- **`admin_users.admin_id` → `support_responses.admin_id`**
    - 문의에 대한 운영자 답변 이력을 기록.
    - 운영자별 응답 건수, 응답 시간 분석 가능.

###  확장 가능성
- **`admin_users.admin_id` → user_status_logs.changed_by`**  
    → 어떤 운영자가 회원 상태를 바꿨는지 기록

- **`admin_users.admin_id` → slip_conditions.override_by`**  
    → 어떤 운영자가 슬립 조치를 수동 해제했는지 기록


### 조인으로 가능한 분석
- 운영자별 콘텐츠 조치 통계
- 운영자별 문의 현황
- 권한 레벨별 활동 분석 → 'role' 기준으로 두 로그 테이블과 조인 하여 권한 그룹별 평균 조치 건수와 응답 건수 비교 


### 💡 서비스 활용 시나리오

1. **권한 기반 접근 제어**
    - `role` 값(`operator`, `manager`, `admin`)에 따라 숨다의 메뉴·기능 접근 제한.
        
2. **운영 감사(Audit)**
    - 콘텐츠 조치나 고객 문의 응답에서 어떤 운영자가 처리했는지 추적 가능.
        
3. **운영자 성과 관리**
    - 두 로그 테이블(`content_moderation_logs`, `support_responses`) 조인으로  
        운영자별 작업량·응답 속도·정확도 분석.
        
4. **보안 관리**
    - 활동 패턴 분석을 통한 이상 징후 감지, 장기 미사용 계정 비활성화.



--- 


# 🗂️ user_status_logs (회원 상태 이력)
### 테이블 목적
- 회원 계정 상태 변경 로그 테이블
- 유저의 변경 대상(user_id)와 변경한 관리자(changed_by)로 어떤 운영자가 어떤 사유로 상태를 변경 했는지 추적 가능
- 계정 상태 변경 기록 기반으로 유저의 보안, 이상 증상 ,행위 추적, 운영 통계에 활용 한다

### 14. user_status_logs (회원 상태 이력)
| name       | description       | 비고                               |
|------------|-------------------|------------------------------------|
| id         | 로그 식별자          | PK                                |
| user_id    | 대상 사용자          | FK → users.id                     |
| old_state  | 변경 전 계정 상태      | active / inactive / resigned / banned 등 |
| new_state  | 변경 후 계정 상태      | active / inactive / resigned / banned 등 |
| changed_by | 변경한 운영자 id      | FK → admins.id (NULL이면 시스템 변경)      |
| changed_at | 변경 시각           |                                    |


### 📌 1:N 관계 (user_status_logs → 관련 테이블)

- **`user_status_logs.user_id` → `users.id`**
    - 상태가 변경된 회원 계정.
        
- **`user_status_logs.changed_by` → `admin_users.admin_id`**
    - 상태를 변경한 운영자 계정.


### 조인 활용 분석
- 관리자(운영자)이 진행한 변경 건수 확인
- 회원별 상태 변경 이력


### 💡 서비스 활용 시나리오

1. **보안 및 운영 감사**
    - 관리자 권한 남용, 실수로 인한 계정 변경 내역 추적 가능.
    
2. **운영 성과 분석**
    - 운영자별 계정 관리 건수, 상태 변경 유형별 통계.
        
3. **사용자 이력 관리**
    - 계정이 비활성/정지/복구된 내역을 고객 문의 대응 자료로 활용.
        
4. **자동화 연계**
    - 특정 상태 변경 시 알림 발송, 후속 조치(데이터 백업, 접근 제한 등) 자동 실행.

--- 
# 🗂️ content_moderation_logs (콘텐츠 조치 로그
### 테이블 목적
- 서비스 내 게시물(숨다 서비스 일기 등)에 대한 운영자가 수행한 콘텐츠 조치 이력 저장
- 삭제, 차단, 복원 등 조치 유형과 사유 기록하여 정책 준수와 운영 감사에 활용



### 15. content_moderation_logs (콘텐츠 조치)
| name       | description      | 비고                                         |
|------------|------------------|----------------------------------------------|
| id         | 로그 식별자         | PK                                          |
| diary_id   | 대상 일기 id        | FK → diaries.id                             |
| action     | 조치 유형           | delete / block / restore 등 (ENUM 권장)       |
| reason     | 사유              | 신고 / 정책 위반 / 요청 등                     |
| admin_id   | 조치한 운영자        | FK → admins.id                              |
| created_at | 기록 시각           |                                             |


### 📌 1:N 관계 (content_moderation_logs → 관련 테이블)

- **`content_moderation_logs.diary_id` → `diary_entries.id`**
    - 조치 대상 콘텐츠(일기)와 연결.
        
- **`content_moderation_logs.admin_id` → `admin_users.admin_id`**
    - 조치 수행자(운영자)와 연결.

### 조인 활용 분석

- 운영자별 콘텐츠 조치 건수 → content_moderation_log + admin_users
- reason 필드를 기준으로  신고/정책 위반/운영자 요청 비율 분석



### 4. 💡 서비스 활용 시나리오

1. **정책 준수 모니터링**
    - 커뮤니티 규칙 위반, 불법 콘텐츠, 개인정보 노출 등의 사유로 조치된 이력을 분석.
        
2. **운영 감사(Audit)**
    - 어떤 운영자가 어떤 콘텐츠를 언제, 왜 조치했는지 추적 가능.
        
3. **통계 리포트 생성**
    - 기간별 조치 건수, 유형별·사유별 비율, 운영자별 처리 현황 보고서 생성.
        
4. **자동화 연계**
    - 특정 사유나 횟수 이상 조치된 콘텐츠 작성자에게 경고/제재 자동 적용.


--- 

# 🗂️ events (운영 이벤트 마스터)
### 테이블 목적
- 서비스에서 진행되는 **운영 이벤트의 마스터 정보**를 저장.
- 제목/설명 및 **진행 기간(start_date~end_date)** 을 기준으로, 출석·미션·보상 등 하위 기능이 참조할 수 있는 **기준 캘린더** 역할.



### 16. events (운영 이벤트 마스터)
| name        | description | 비고                                |
| ----------- | ----------- | --------------------------------- |
| id          | 이벤트 식별자     | PK                                |
| title       | 제목          |                                   |
| description | 설명          |                                   |
| start_date  | 시작일         | 시작 포함 종료 미포함                      |
| end_date    | 종료일         | 시작 포함 종료 미포함 NULL 허용 → 무기한 이벤트 가능 |
| created_at  | 생성 시각       |                                   |


### **운영/분석에서 중심 노드**

- **운영자 관점**
    - “이번 5월 출석 이벤트”를 관리할 때 → 단일 이벤트 id로 모든 데이터 추적 가능.
        
- **분석가 관점**
    - “이벤트별 참여율/재방문율/매출 기여도” 분석 가능.
        
- **백오피스 관점**
    - `events`를 루트로 잡고 관련 테이블을 조인하면, 운영 보고서 자동 생성 가능.
    



# 📌 1:N 관계 (events → 관련 테이블)

- **직접 FK: (현재 없음)**  
    현 스키마에서는 다른 테이블이 `events.id`를 직접 참조하지 않음.
    
- **간접/운영상 연계 (현 구조로 가능한 방식)**
    - `notifications` : 이벤트 안내/리마인더 알림 발송(타입 `event`).
    - `user_points_ledger` : `ref_type='event'`, `ref_id`에 이벤트 관련 트랜잭션을 기록(폴리모픽 &  ref_type/ref_id에 관련 객체 식별, 유형 event, payment등 기능 명시되어 이것을 활용).
        
- **확장 포인트(권장)**
    - `event_attendance.event_id` → `events.id` : 참여/출석 기록과 직접 연결.
    - `notifications.announcement_id` 또는 `notifications.event_id` : 공지/알림을 이벤트에 매핑.
    - `rewards(event_id, …)` : 보상 정책을 이벤트별로 정의.


### 조인 활용 분석

- **(현 구조, 간접) 이벤트 기간 알림 효과**
    - `events` + `notifications`(type='event', created_at ∈ 기간)  
        → 이벤트 기간에 발송된 알림 건수/읽음률 분석.
        
- **(현 구조, 간접) 포인트 지급 효과**
	- points_ledger`(ref_type='event', created_at ∈ 기간)  
        → 이벤트로 발생한 포인트 총액·참여자 수 추정.
        
- **(확장 후) 참여율/보상 분석**
    - `events` + `event_attendance`(event_id FK)  
        → 이벤트별 참여자 수, 연속 출석(`streak`) 분포.
    - `events` + `user_points_ledger`(ref_type='event')  
        → 참여자당 평균 보상, 보상 코드 사용률.


### 💡 서비스 활용 시나리오

1. **이벤트 운영 캘린더**
    - 관리자 화면에서 기간/설명 관리 → 클라이언트는 진행 중 이벤트만 노출.
        
2. **알림/공지와 연계**
    - 시작 전 안내, 진행 중 리마인더, 종료 전 마지막 안내 발송.
        
3. **출석/미션형 이벤트 기반 데이터의 기준키** _(확장 시)_
    - `event_attendance.event_id`로 참여·리워드 내역을 이벤트 단위로 집계.
        
4. **성과 리포트**
    - 기간 내 알림 효과, 포인트 소요, (확장 시) 참여율/재방문율 리포트 생성.

--- 
# 🗂️ api_logs (API 호출 기록)

### 테이블목적
- 시스템에서 발생하는 API 호출 이력 저장하는 로그 테이블
- 호출 주체(user_id), HTTP 메서드, 요청 경로, 응답 상태 코드, 지연 시간등 기록
- 성능 모니터링 보안  감사, 사용 패턴 분석 근거
- 숨다 서비스 성능, 안정성 유지 및 핵심 운영 지표인 로그 테이블
### 17. api_logs (API 호출 기록)
| name        | description        | 비고                                 |
|-------------|--------------------|--------------------------------------|
| id          | 로그 식별자           | PK                                   |
| user_id     | 호출 주체            | FK → users.id, 익명/시스템이면 NULL      |
| method      | HTTP 메서드          | GET / POST / PUT / DELETE 등           |
| endpoint    | 엔드포인트 경로        | /api/v1/...                          |
| status_code | 응답 상태 코드         | 예: 200 / 400 / 500                   |
| latency_ms  | 응답 지연 (밀리초)     | 요청~응답 시간 스냅샷                   |
| created_at  | 호출 시각            |                                      |


### . 📌 1:N 관계 (api_logs → 관련 테이블)

- **`api_logs.user_id` → `users.id`**
    - API 호출을 수행한 사용자 계정과 연결.
    - 비로그인/시스템 호출인 경우 `NULL` 저장.
        
- (확장 가능) `admin_users.admin_id` FK 추가 시 → 운영자 API 호출 로그와 직접 연결 가능.



### 조인 활용 분석
- 사용자별 API 호출 건수
- 엔드포인트별 평균 응답 지연
- 기간별 오류 비율

### 💡 서비스 활용 시나리오

1. **성능 모니터링**
    - API별 평균 응답 속도, 최대 지연 발생 구간 파악.
        
2. **보안 및 이상 징후 탐지**
    - 비정상 호출 빈도, 잘못된 요청(status_code 4xx), 서버 오류(5xx) 비율 분석.
        
3. **사용자 행동 분석**
    - 사용자별 API 사용 패턴 분석 → 인기 기능·경로 파악.
        
4. **운영자/시스템 호출 분리**
    - `user_id`가 NULL인 로그는 시스템 호출로 분류, 추후 `admin_id` 컬럼 확장 가능.

---
# 🗂️ error_logs (에러 로그 기록)
### 테이블 목적
- 서비스 전반에서 발생한 에러/예외 상황 저장 하는 테이블
- 심각도(severity), 메시지 요약(mssage), 스택(stak) 추적 정보, 발생 서비스/컴포넌트명을 기록하여 장애 원인 파악 및 대응에 활용 한다.
- 이벤트, 결제, 숨다 콘텐츠, 숨다의 운영 및 서비스에 필요한 모든 영역에 1:N 관계 형성 할 수있는 중앙 로그 역할
- 숨다 서비스의 모든 에러 총괄, 장애 분석, 성능, 보안 등등


# 제안
- error_logs는 최소한의 컬럼으로만 이루어져 
  여러개의 테이블에서 발생한 오류를 처리 및 저장할 다른 단독 테이블 즉
  1:1 관계의 테이블이 필요 하다고 판단

### 18. error_logs (에러 로그)
| name       | description        | 비고                          |
|------------|--------------------|-------------------------------|
| id         | 로그 식별자           | PK                           |
| severity   | 심각도(Level)        | info / warn / error / fatal 등 |
| message    | 에러 메시지 요약       | 짧은 설명                     |
| stack      | 스택/추적 텍스트       | 긴 텍스트 가능                  |
| service    | 발생 서비스/컴포넌트 명 | 예: api / worker / batch 등     |
| created_at | 발생 시각            |                               |


### 📌 1:N 관계 (error_logs → 관련 테이블)
현재 직접적으로 연결된 테이블은 없으나 서비스 운영, 관리에 필요하며 다양한 로그/운영, 이벤트, 유저 등과 조인하여 맥락 분석 가능
- **`error_logs` + `api_logs`**
    - 동일 시간대/서비스명 매칭 → API 호출 중 발생한 에러 식별.
        
- **`error_logs` + `user_status_logs`**
    - 계정 상태 변경 직전/직후 에러 여부 확인.
    
- **`error_logs` + `content_moderation_logs` / `slip_conditions`**
    - 운영자 조치나 슬립 실행 직후 발생한 시스템 오류 확인.


### 추가 적인 1:N 테이블 관계 제안

### 1. 이벤트(Event) 도메인

- **`error_logs.service = 'event'`** + `events.id`
    - 이벤트 생성/수정/참여 중 발생한 오류 기록.
    - 예: `event_attendance`에서 출석 처리 실패, 리워드 지급 실패 등.
        

### 2. 결제(Payment) 도메인

- **`error_logs.service = 'payment'`** + `payments.id`
    - 결제 요청, 승인, 취소, 환불 과정에서 발생한 오류 기록.
    - PG사 응답 지연, 금액 불일치, 중복 결제 방지 로직 실패 등.
        

### 3. 콘텐츠(일기/게시물) 도메인

- **`error_logs.service = 'diary'`** + `diary_entries.id`
    - 일기 작성/수정/삭제/분석 중 발생한 오류 기록.
    - 파일 업로드 실패, 암호화/복호화 오류, 감정 분석 API 실패 등.
        

### 4. 계정(User) 도메인

- **`error_logs.service = 'user'`** + `users.id`
    - 회원가입, 로그인, 상태 변경(user_status_logs)에서 발생한 오류.
    - 비정상 접근, 인증 토큰 만료, 비밀번호 해시 불일치 등.
        

### 5. 운영(Admin) 도메인

- **`error_logs.service = 'admin'`** + `admin_users.admin_id`
    - 관리자 페이지에서의 설정 변경 실패, 권한 체크 오류 등.


### 💡 서비스 활용 시나리오 (제안 사항 반영)

1. **이벤트 운영 품질 모니터링**
    - `event_attendance` 집계 오류, 리워드 지급 실패 등을 `error_logs`에 기록 → 이벤트별 장애 리포트 작성.
        
2. **결제 실패 원인 분석**
    - `payments`와 조인하여 PG사 오류, 네트워크 지연, 결제 취소 실패 원인 분류.
        
3. **콘텐츠 처리 오류 대응**
` 작성/분석 중 오류 발생 시 즉시 알림 → 데이터 유실 방지.
        
4. **이상 유저 계정 탐지**
    - `users`/`user_status_logs`와 조인하여 반복 로그인 실패, 비정상 IP 접근 등 보안 로그로 활용.
        
5. **운영자 작업 실패 추적**
    - `admin_users`와 조인해 관리자 페이지 변경 작업에서 발생한 오류를 기록·분석
    
6. 로그인 실패 에러 로그 저장
    - `a
	 
 


error_logs (PK: id)
│
├── service (ENUM: 'event', 'payment', 'diary', 'user', 'admin')
├── ref_id (UUID) → 도메인별 참조 키
├── severity, message, stack, created_at
│
├── [1:N] events                ← service='event'   AND ref_id = events.id
│     ├── id (PK)
│     ├── title, description, start_date, end_date, created_at
│
├── [1:N] payments              ← service='payment' AND ref_id = payments.id
│     ├── id (PK)
│     ├── user_id (FK → users.id)
│     ├── amount, currency, method, created_at
│
├── [1:N] diary_entries         ← service='diary'   AND ref_id = diary_entries.id
│     ├── id (PK)
│     ├── user_id (FK → users.id)
│     ├── title, content_enc, created_at
│
├── [1:N] users                 ← service='user'    AND ref_id = users.id
│     ├── id (PK)
│     ├── email, password_hash, state, created_at
│
└── [1:N] admin_users           ← service='admin'   AND ref_id = admin_users.admin_id
      ├── admin_id (PK)
      ├── email, role, created_at


요약: error_logs를 1대1로 하기위해서  5개의 테이블 새로 추가 제안


--- 

# 🗂️ support_inquiries (문의 접수)

### 테이블 목적
- 사용자가 제출한 고객 문의 티겟을 저장
- 결제, 계정, 버그 등 문의 유형별로 분류
- 회원/비회원 모두 접수 가능(비회원은 user_id NULL값)
- 문의 상태는 open/pending/closed를 통해 진행 상황 추적

### 19. support_inquiries (문의 접수)
| name       | description      | 비고                                            |
|------------|------------------|-------------------------------------------------|
| id         | 문의 식별자         | PK                                             |
| user_id    | 문의자             | FK → users.id, 비회원 문의면 NULL 가능              |
| category   | 문의 유형           | 결제 / 계정 / 버그 등 (ENUM 또는 별도 테이블 권장)   |
| message    | 문의 본문           |                                                 |
| status     | 상태              | open / pending / closed 등 (ENUM 권장)            |
| created_at | 접수 시각           |                                                 |



### 📌 1:N 관계 (support_inquiries → 관련 테이블)

- **`support_inquiries.id` → `support_responses.inquiry_id`**
    
    - 한 건의 문의 티켓에 대해 여러 운영자 답변 이력 기록 가능.
        
- **`support_inquiries.user_id` → `users.id`**
    
    - (회원 문의의 경우) 해당 사용자의 계정 정보와 연결 가능.
        
- **`support_inquiries.id` → `error_logs.ref_id` (service='support')**
    
    - 문의 처리 중 발생한 오류 기록 가능.



### 💡 서비스 활용 시나리오

1. **고객센터 운영**
    - 문의 유형별 담당자 자동 배정 (결제 → 결제팀, 계정 → 운영팀).
        

2. **FAQ 개선**
    
    - 빈번하게 반복되는 문의 카테고리 → FAQ로 전환, 문의량 감소.
        
3. **오류 재현 요청**
    
    - 버그 문의의 경우 첨부 로그/스크린샷 수집 후 `error_logs`와 연계해 재현 테스트.


---
# 🗂️ support_responses (문의 답변)
### 테이블 목적
- 고객 문의 테이블(support_responses)에 대한 운영자의 답변 이력 저장
- 한 문의에 여러 번의 추가 답변/재문의 가능하도록 대화형 기록 유지한다.



### 20. support_responses (문의 답변)
| name       | description   | 비고                          |
|------------|---------------|-------------------------------|
| id         | 답변 식별자      | PK                           |
| inquiry_id | 대상 문의 id     | FK → support_inquiries.id     |
| admin_id   | 답변 운영자      | FK → admins.id                |
| response   | 답변 본문       |                               |
| created_at | 답변 시각       |                               |


### 📌 1:N 관계 (support_responses → 관련 테이블)

- **`support_responses.inquiry_id` → `support_inquiries.id`**
    
    - 하나의 문의에 대해 여러 답변(1:N). 문의/응답 스레드 구성.
        
- **`support_responses.admin_id` → `admin_users.admin_id`**
    
    - 어떤 운영자가 답변했는지 추적.
        
- **(선택) `error_logs` 연계**
    
    - 답변 발송 실패, 첨부 업로드 실패 등 오류 발생 시 `error_logs(service='support', ref_id = support_responses.id)`로 기록 가능.
        
- **(선택) `notifications` 연계**
    
    - 고객에게 답변 도착 알림을 보낼 경우 `notifications.user_id`와 운영상 매핑.


### 조인 활용 분석
- 문의별 첫 응답 시간
- 운영자별 처리 건수
- 카테고리별 평균 응답 횟수

### 💡 서비스 활용 시나리오

1. **SLA 모니터링**
    
    - 문의 생성 → 첫 답변까지의 시간(FRT)과 전체 해결까지의 답변 횟수/기간 측정.
        
2. **운영자 퍼포먼스 관리**
    
    - `admin_id` 기준으로 답변량/평균 응답시간/재오픈률 집계.
        
3. **알림/UX 연계**
    
    - 답변 등록 시 고객에게 앱/이메일 알림 발송, 미열람 시 리마인더.
        
4. **지식 축적/FAQ 개선**
    
    - 반복 답변을 태깅하여 `support_faq`로 승격, 답변 템플릿화.
        
5. **오류 대응**
    
    - 답변 저장/발송 실패를 `error_logs`에 적재 → 재발송 큐/재시도 로직 연동.
    
--- 

# 🗂️ login_logs (로그인/기기 기록)

### 테이블 목적
- 사용자의 로그인 시도 이력을 저장
- 성공/실패 여부, 접속, IP, 기기, 브라우저 정보를 기록하여 보안 분석, 계정 품질 모니터링, 장애 분석의 근거 데이터로 활용
- 로그인 실패 시 사유를 error_logs에 연계하여 상세 분석

### 21. login_logs (로그인/기기)
| name       | description | 비고                       |
| ---------- | ----------- | ------------------------ |
| id         | 로그 식별자      | PK                       |
| user_id    | 사용자 id      | FK → users.id            |
| ip         | 접속 IP       | IPv4/IPv6 지원             |
| device     | 접속 기기       | 예: iPhone 15, Galaxy S24 |
| ua         | 유저에이전트 문자열  | 브라우저/앱 클라이언트 정보          |
| success    | 로그인 성공 여부   | boolean                  |
| created_at | 로그인 시각      |                          |

### 📌 1:N 관계 (login_logs → 관련 테이블)

- **`login_logs.user_id` → `users.id`**
    
    - 어떤 사용자가 로그인 시도를 했는지 추적.
        
- **(제안) `error_logs.ref_id`** (`service='login'`)
    
    - 실패한 로그인 시도의 상세 원인 기록.
        
    - 예: 비밀번호 불일치, 계정 잠금, 인증 서버 오류 등.
        
- **(제안) `notifications.user_id`**
    
    - 보안 알림 발송(이상 로그인 감지 시).




### 조인 활용 분석
- 사용자별 최근 로그인 IP
- 로그인 실패율 분석
- 이상 로그인 탐지(해킹, 이상 IP, 동일 IP 다수 계정시도등)

### 💡 서비스 활용 시나리오

1. **보안 경고 시스템**
    
    - 동일 IP/기기에서 다수의 로그인 실패 발생 → 보안팀 경고 및 IP 차단.
        
2. **계정 도용 방지**
    
    - 해외 IP 또는 비정상 패턴 로그인 시도 시, 해당 계정 잠금 또는 2FA 강제.
        
        
3. **로그인 UX 개선**
    
    - 기기별 로그인 성공/실패 로그를 분석하여 인증 절차 최적화.
        
4. **error_logs 연계 분석**
    
    - 실패 건의 원인을 `error_logs` 1:1로 연결해 장애·보안 이슈를 한 번에 추적.
--- 
# 🗂️ slip_conditions (윤리/슬립 실행 기록)
### 테이블 목적
- **티어(Tier) 기반 감정 분석 결과**를 활용해 사용자의 상태를 **경고/슬립(서비스 일시 중단)로 전환한 이력을 저장.
    
- 트리거 근거(`metrics`)에 감정 지표(센티멘탈 점수, 센터멘탈 레벨, 티어 몰입 척도 등)를 JSON 형태로 보관해 **판단 근거 투명성 확보**.
    
- 슬립 적용 상태(`status`), 지속 시간(`duration`), 발동·해제 시각(`triggered_at`, `released_at`)을 기록하여 **운영·윤리 정책 감사** 가능.
- 오버라이드(override_by, override_reason)기록을 통해 오판 사례 분석 및 제발 방지 활용

### 22. slip_conditions (윤리/슬립 실행 기록)
| name            | description          | 비고                                                        |
|-----------------|----------------------|-------------------------------------------------------------|
| id              | 레코드 식별자           | PK                                                          |
| user_id         | 대상 사용자             | FK → users.id                                               |
| metrics         | 트리거 근거             | JSON (tier_a, tier_m, rule, score, ruleset_version 등)        |
| status          | 적용 상태              | normal / warning / slipped 등 (ENUM 권장)                     |
| duration        | 제한 지속 시간 표현값     | 예: '7 days', '24 hours' 등                                  |
| triggered_at    | 발동 시각              |                                                             |
| released_at     | 해제 시각              |                                                             |
| override_by     | 운영자 오버라이드 주체    | FK → admins.id (NULL 가능)                                   |
| override_reason | 오버라이드 사유          | 운영자 코멘트                                                |


### 📌 1:N 관계 (slip_conditions → 관련 테이블)

- **`slip_conditions.user_id` → `users.id`**  
    슬립 대상 사용자.
    
- **`slip_conditions.override_by` → `admin_users.admin_id`**  
    수동 해제·변경을 수행한 운영자.
    
- **간접 연계 제안**
    
    - `analysis_results` : 슬립 트리거 발생 당시의 감정 분석 결과(티어, 감정 파형, 핵심 단어 등).
        
    - `notifications` : 슬립 적용·해제 안내 알림 발송 이력.
        
    - `user_status_logs` : 슬립으로 인한 계정 상태 변경을 별도 이력으로 관리.
        
    - `error_logs` : 슬립 판단 로직 실패, 알림 발송 오류 등 예외 상황 기록.



### 조인 활용 분석 예시
- 슬립 발생 이력
- 오버라이드 사례 분석
- 티어 지표 vs 슬립 상태 상관관계

### 💡 서비스 활용 시나리오

1. **정상/위험 티어 구분 강화**
    
    - `metrics` 내 감정 파형, 핵심 단어, 문맥 정보를 활용해  
        "건강한 고티어(성취감+몰입)"와 "위험 고티어(분노·우울·위험 감정)"를 분류.
        
2. **슬립 오판 방지 로직 개선**
    
    - 분석 모델에서 티어 점수뿐 아니라 감정 파형 안정성 지표·문맥 긍정도 등을 함께 반영.
        
    - 예: 티어 3.8 + 긍정도 높음 + 성취 키워드 다수 → 슬립 미적용.
        
3. **정책 예외 처리**
    
    - 위험감정이 아니더라도 티어 급등이 반복되면 부드러운 리마인더만 제공(`status='warning'`--> 부드러운? 메시지 표시로 제안).
        
4. **오버라이드 감사**
    
    - 운영자가 수동 해제한 기록을 분석해 모델 개선 피드백으로 활용.
        
5. **장기 통계 분석**
    
    - 기간별 슬립 빈도, 평균 지속 시간, 재발율 → 정책 튜닝·모델 학습 데이터로 사용.

---

## 3) 정책/버전/오버라이드(+4)

### 23. admin.ai_policy_versions (정책 스냅샷)
| name       | description     | 비고                                                |
|------------|-----------------|-----------------------------------------------------|
| id         | 정책 버전 식별자    | PK                                                 |
| policy_name| 정책명            | 'ethics' / 'slip' / 'tone' / 'mode' 등                 |
| version    | 버전 문자열        | 예: v1.0.3                                          |
| scope      | 적용 범위         | global / tenant:{id} / user:{id}                    |
| config     | 정책 내용          | JSON (임계값, 화이트리스트, 블록 단어, 가중치 표 등)    |
| created_by | 생성 운영자        | FK → admins.id                                      |
| created_at | 생성 시각          |                                                     |


### 24. admin.ai_policy_active (활성 포인터)
| name       | description     | 비고                                                |
|------------|-----------------|-----------------------------------------------------|
| id         | 정책 버전 식별자    | PK                                                 |
| policy_name| 정책명            | 'ethics' / 'slip' / 'tone' / 'mode' 등                 |
| version    | 버전 문자열        | 예: v1.0.3                                          |
| scope      | 적용 범위         | global / tenant:{id} / user:{id}                    |
| config     | 정책 내용          | JSON (임계값, 화이트리스트, 블록 단어, 가중치 표 등)    |
| created_by | 생성 운영자        | FK → admins.id                                      |
| created_at | 생성 시각          |                                                     |

### 25. admin.ai_overrides (오버라이드/실험)
| name       | description      | 비고                                                          |
|------------|------------------|---------------------------------------------------------------|
| id         | 오버라이드 식별자   | PK                                                            |
| target     | 적용 대상         | 'global' / 'tenant:{id}' / 'user:{id}'                        |
| key        | 키 경로           | 예: 'tone', 'mode', 'slip.duration'                           |
| value      | 적용 값           | JSON ({mode:'mirror', tone:'gentle'} 등)                      |
| reason     | 사유             | AB / 핫픽스 / 문의 대응 등                                     |
| expires_at | 만료 시각          | NULL이면 무기한                                                 |
| created_by | 생성 운영자        | FK → admins.id                                                |
| created_at | 생성 시각          |                                                              |


### 26. admin.prompt_registry (프롬프트/모델 버전)
| name       | description       | 비고                                                  |
|------------|-------------------|-------------------------------------------------------|
| id         | 프롬프트 식별자      | PK                                                    |
| name       | 프롬프트 이름        | 업무/기능 단위 명칭                                       |
| model      | 사용 모델 이름       | ex: gpt-4, llama-3                                     |
| version    | 템플릿 버전         |                                                       |
| template   | 프롬프트 원문        | 플레이스홀더 포함 가능                                     |
| metadata   | 부가 메타           | JSON (토큰 한도, 안전가드, 샷샘플 등)                        |
| created_by | 생성 운영자          | FK → admins.id                                        |
| created_at | 생성 시각           |                                                       |


---

## 4) 메모/체크
- `reports.summary`와 `analysis_results.metadata`의 키 스펙은 별도 문서로 확정.
- 개인정보/민감정보는 원문 접근 차단, 결과만 운영 노출.
- 환경별 정책 전환은 `ai_policy_active` 포인터 교체로 배포.

