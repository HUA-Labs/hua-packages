# 다국어 번역 및 로컬라이징 정책 (Persona Design)

## 개요

숨다이어리는 각 언어별로 고유한 페르소나(Persona)를 적용하여 단순한 번역이 아닌 **로컬라이징(Localization)**을 구현합니다. 각 언어는 고유한 문화적 뉘앙스와 감성을 반영하여 사용자에게 더 친밀하고 자연스러운 경험을 제공합니다.

---

## 일본어 (JP): 상냥하고 따뜻한 반말 (Tameguchi/Friendly)

### 바이브
옆에서 친한 친구가 일기장을 내밀며 "오늘 하루는 어땠어?"라고 묻는 느낌.

### 특징
- 딱딱한 입니다/합니까(~desu/masu)보다는 **~다네(~dane)**, **~dayo** 같은 부드러운 종결 어미 사용
- 친근하고 편안한 반말 톤 유지
- 감성적이고 따뜻한 표현 선호
- 일본 특유의 '에모이(Emoy/감성적인)'한 느낌 극대화

### 목표
일본 특유의 '에모이(Emoy/감성적인)'한 느낌을 극대화하여 사용자가 일기를 쓰는 것이 마치 친한 친구와 대화하는 것처럼 느껴지도록 합니다.

### 번역 예시
- ❌ "일기를 작성해주세요" → "日記を書いてください"
- ✅ "일기를 작성해주세요" → "日記を書いてみてね" 또는 "今日の気持ちを書いてみよう"

---

## 미국/영어권 (US): 외향적인 저널링 메이트 (Extraverted & Journalistic)

### 바이브
뉴욕의 카페에서 세련된 불렛 저널을 쓰는 힙한 작가 느낌.

### 특징
- "Please enter your diary" 같은 기계적인 문구 대신 **"Capture your moment"**, **"Let's reflect on your day"** 같이 에너지가 느껴지는 표현 사용
- 단어 선택은 잡지(Journal)처럼 정갈하고 세련되게
- 개인의 성장과 자기계발에 초점
- 활동적이고 긍정적인 톤 유지

### 목표
개인의 성장을 기록한다는 성취감과 세련미를 강조하여, 일기 작성이 단순한 기록이 아닌 자기계발의 도구로 느껴지도록 합니다.

### 번역 예시
- ❌ "Please enter your diary" → 기계적이고 딱딱함
- ✅ "Capture your moment" → 에너지 있고 활동적
- ❌ "Save your diary" → "저장하세요"
- ✅ "Let's reflect on your day" → "오늘 하루를 되돌아봐요"

---

## 한국어 (KR): 담백하고 깊이 있는 감성

### 바이브
종이 질감에 딱 어울리는 가장 담백하고 깊이 있는 한국어 감성.

### 특징
- 과하지 않고 절제된 표현
- 깊이 있고 진중한 톤
- 종이 질감의 디자인과 조화를 이루는 자연스러운 문구
- 대표님 직인 검수로 최종 확정

### 목표
종이 질감의 디자인과 완벽하게 어울리는 담백하고 깊이 있는 한국어 감성을 구현합니다.

### 번역 예시
- 모든 한국어 번역은 대표님의 직접 검수를 거쳐 최종 확정됩니다.

---

## AI 번역 지시사항 (오푸스용)

### 지시사항 템플릿

```
지금부터 각 언어별로 단순 번역이 아닌 **'로컬라이징 페르소나'**를 적용해.

**일본어 (JP)**:
- 친근한 반말로 유저의 마음을 어루만지는 느낌으로
- ~다네(~dane), ~dayo 같은 부드러운 종결 어미 사용
- 딱딱한 ~desu/masu 형식 지양
- 일본 특유의 '에모이(Emoy/감성적인)'한 느낌 극대화
- 친한 친구가 일기장을 내밀며 "오늘 하루는 어땠어?"라고 묻는 느낌

**영어 (US)**:
- 지적이고 활동적인 저널리스트가 제안하는 느낌으로
- "Please enter your diary" 같은 기계적인 문구 대신 "Capture your moment", "Let's reflect on your day" 같이 에너지가 느껴지면서도 단어 선택은 잡지(Journal)처럼 정갈하게
- 개인의 성장을 기록한다는 성취감과 세련미 강조
- 뉴욕의 카페에서 세련된 불렛 저널을 쓰는 힙한 작가 느낌

**한국어 (KR)**:
- 종이 질감에 딱 어울리는 가장 담백하고 깊이 있는 한국어 감성
- 대표님 직인 검수 예정이므로, 기본 가이드라인만 제공

모든 번역 키(landing.json, diary.json)를 이 바이브에 맞춰서 다시 써봐.
```

---

## 적용 대상 파일

### 랜딩 페이지 (landing.json)
- `apps/my-app/app/lib/translations/ko/landing.json`
- `apps/my-app/app/lib/translations/en/landing.json`
- `apps/my-app/app/lib/translations/ja/landing.json`

**주요 키:**
- `heroTagline`: 히어로 슬로건
- `heroTitle`: 메인 타이틀
- `ctaTry`: "일기 체험하기" 버튼
- `ctaStart`: "무료로 시작하기" 버튼
- `ctaLogin`: "로그인" 버튼
- `socialLogin`: 소셜 로그인 섹션 제목
- `kakaoLogin`: 카카오 로그인 버튼
- `googleLogin`: 구글 로그인 버튼
- `featureAiTitle`: AI 감정 분석 기능 제목
- `featureAiDesc`: AI 감정 분석 기능 설명
- `featurePrivacyTitle`: 완전한 프라이버시 기능 제목
- `featurePrivacyDesc`: 완전한 프라이버시 기능 설명
- `featureInsightTitle`: 개인화된 인사이트 기능 제목
- `featureInsightDesc`: 개인화된 인사이트 기능 설명

### 일기 관련 (diary.json)
- `apps/my-app/app/lib/translations/ko/diary.json`
- `apps/my-app/app/lib/translations/en/diary.json`
- `apps/my-app/app/lib/translations/ja/diary.json`

**주요 키:**
- `title`: 일기 제목
- `write`: 일기 작성
- `edit`: 일기 수정
- `delete`: 일기 삭제
- `save`: 저장
- `cancel`: 취소
- `draft`: 임시저장
- `content`: 내용
- `date`: 날짜
- `emotion`: 감정
- `analysis`: 분석
- `noDiaries`: 작성된 일기가 없습니다
- `writeFirst`: 첫 일기를 작성해보세요

---

## 번역 작업 프로세스

### 1. AI 초안 생성
- 오푸스에게 위의 지시사항을 제공하여 초안 생성
- 각 언어별 페르소나에 맞춰 번역

### 2. 검수 및 수정
- **일본어**: 페르소나 가이드라인에 맞는지 확인
- **영어**: 저널리스트 톤과 에너지가 잘 반영되었는지 확인
- **한국어**: 대표님 직인 검수

### 3. 적용
- 번역 파일 업데이트
- UI에서 테스트 및 피드백 반영

---

## 참고사항

- 모든 번역은 **문맥(Context)**을 고려하여 작성되어야 합니다.
- 단순한 단어 대체가 아닌, **전체적인 톤과 느낌**을 반영해야 합니다.
- 각 언어의 문화적 뉘앙스를 존중하며, 과도한 번역투를 지양합니다.
- 한국어는 대표님의 직접 검수를 거치므로, 다른 언어와 달리 별도의 AI 초안 검수 단계가 필요합니다.

---

## 업데이트 이력

- 2025-12-23: 초안 작성 (다국어 정책 문서화)

