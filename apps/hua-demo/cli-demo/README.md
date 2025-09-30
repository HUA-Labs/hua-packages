# HUA API Demo

HUA API를 로컬에서 직접 테스트해보세요! 🚀

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 데모 실행
npm start
```

## 사용법

1. **API 키 발급**: [HUA API 키 발급 페이지](https://api.hua.ai.kr/api-key)에서 API 키를 발급받으세요
2. **데모 실행**: `npm start` 명령어로 데모를 실행하세요
3. **대화 시작**: 프롬프트에 메시지를 입력하고 AI와 대화해보세요

## 예제 코드

```javascript
const { HuaSDK } = require('@hua/sdk-lite');

const sdk = new HuaSDK('your-api-key');
const response = await sdk.chat({
  message: '안녕하세요!',
  userId: 'demo-user'
});

console.log(response.data.message);
```

## 기능

- ✅ 실시간 AI 채팅
- ✅ 다양한 톤과 모드 설정
- ✅ 토큰 사용량 확인
- ✅ 에러 처리
- ✅ 간단한 CLI 인터페이스

## 지원

- 📧 이메일:[echonet.ais@gmail.com](echonet.ais@gmail.com)
- 📖 문서: [API 문서](https://your-domain.com/docs)
- 🐛 이슈: [GitHub Issues](https://github.com/HUA-Labs/hua-api/issues)

---

**HUA Labs** - 감정 인식 AI 챗봇 API

---

[한국어 README](README.md) | [English README](README_EN.md)
