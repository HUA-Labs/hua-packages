# HUA API Demo Collection

🌏 HUA API의 다양한 데모 모음 - CLI 및 웹 버전

## 📁 프로젝트 구조

```text
hua-demo/
├── cli-demo/          # CLI 기반 데모 (Node.js)
├── web-demo/          # 웹 기반 데모 (React + Vite)
└── README.md          # 이 파일
```

## 🚀 데모 종류

### 1. CLI Demo (`cli-demo/`)

- **Node.js 기반** 터미널 애플리케이션
- **인터랙티브 채팅** 기능
- **다양한 테스트 모드** (톤, 모드, 티어, 토큰 사용량 등)
- **한국어/영어** 언어 지원
- **실시간 토큰 사용량** 확인

### 2. Web Demo (`web-demo/`)

- **React + TypeScript** 기반 웹 애플리케이션
- **모던 UI/UX** (Tailwind CSS)
- **반응형 디자인**
- **실시간 응답** 및 로딩 상태
- **브라우저 기반** 체험

## 🛠️ 설치 및 실행

### CLI Demo 실행

```bash
cd cli-demo
npm install
node demo.js          # 영어 버전
node demo_ko.js       # 한국어 버전
```

### Web Demo 실행

```bash
cd web-demo
npm install
npm run dev
```

## ✨ 주요 기능

### 공통 기능

- ✅ **HUA SDK Lite** 연동
- ✅ **API 키 인증** 시스템
- ✅ **OpenAI API 키** 선택적 사용
- ✅ **한국어/영어** 언어 전환
- ✅ **톤/모드/티어** 프리셋 지원
- ✅ **토큰 사용량** 모니터링
- ✅ **에러 처리** 및 사용자 안내

### CLI Demo 특화 기능

- 🎯 **인터랙티브 채팅** 모드
- 🎯 **다양한 테스트** 시나리오
- 🎯 **실시간 대화** 체험
- 🎯 **컬러풀한 터미널** UI

### Web Demo 특화 기능

- 🌐 **브라우저 기반** 접근
- 🌐 **모던 웹 UI** (Tailwind CSS)
- 🌐 **반응형 디자인**
- 🌐 **실시간 로딩** 상태
- 🌐 **직관적인 폼** 인터페이스

## 🔧 기술 스택

### CLI Demo

- **Node.js** - 런타임 환경
- **@hua-labs/api-lite** - HUA API 클라이언트
- **readline** - 터미널 입력 처리

### Web Demo

- **React 18** - UI 프레임워크
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **@hua-labs/api-lite** - HUA API 클라이언트

## 📋 사용법

### 1. API 키 발급

- [HUA API 키 발급 페이지](https://api.hua.ai.kr/api-key)에서 키를 발급받으세요
- OpenAI API 키는 선택사항입니다 (실제 GPT 응답을 위해)

### 2. 데모 실행

- **CLI**: 터미널에서 직접 실행하여 다양한 테스트 모드 체험
- **Web**: 브라우저에서 웹 인터페이스를 통해 직관적으로 체험

### 3. 기능 체험

- **톤(Tone)**: gentle, warm, cheerful, quirky, delicate
- **모드(Mode)**: empathy, analysis, suggestion, praise, playful
- **티어(Tier)**: 1.0 (기본), 2.0 (고급), 3.0 (프리미엄)
- **언어**: 한국어(ko), 영어(en)

## 🎯 사용 시나리오

### CLI Demo 적합한 경우

- 🖥️ **개발자 테스트** - API 기능 빠른 검증
- 🖥️ **QA 테스트** - 다양한 시나리오 체계적 테스트
- 🖥️ **파트너 데모** - 터미널 환경에서의 프레젠테이션
- 🖥️ **자동화 스크립트** - CI/CD 파이프라인 통합

### Web Demo 적합한 경우

- 🌐 **일반 사용자** - 브라우저 기반 쉬운 접근
- 🌐 **마케팅 데모** - 시각적으로 매력적인 프레젠테이션
- 🌐 **교육 목적** - 직관적인 UI로 개념 이해
- 🌐 **프로토타이핑** - 실제 서비스 UI/UX 검증

## 🔗 관련 프로젝트

- **[HUA API](https://api.hua.ai.kr)** - 메인 API 서비스
- **[HUA SDK Lite](https://www.npmjs.com/package/@hua-labs/api-lite)** - 공식 JavaScript SDK
- **[HUA API Documentation](https://api.hua.ai.kr/docs)** - API 문서

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 문의

- **API 관련**: [HUA API 문서](https://api.hua.ai.kr/docs)
- **SDK 관련**: [HUA SDK Lite](https://www.npmjs.com/package/@hua-labs/api-lite)
- **이슈 리포트**: GitHub Issues

---

**HUA API Demo Collection** - 감정형 AI 미들웨어의 다양한 체험을 제공합니다 💙
