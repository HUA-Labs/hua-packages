# HUA API Demo

Test HUA API directly on your local machine! 🚀

## Installation & Execution

```bash
# Install dependencies
npm install

# Run demo
npm start
```

## Usage

1. **Get API Key**: Get your API key from [HUA API Key Issuance Page](https://api.hua.ai.kr/api-key)
2. **Run Demo**: Execute `npm start` to run the demo
3. **Start Chatting**: Enter messages in the prompt and chat with AI

## Example Code

```javascript
const { HuaSDK } = require('@hua/sdk-lite');

const sdk = new HuaSDK('your-api-key');
const response = await sdk.chat({
  message: 'Hello!',
  userId: 'demo-user'
});

console.log(response.data.message);
```

## Features

- ✅ Real-time AI Chat
- ✅ Various Tone & Mode Settings
- ✅ Token Usage Monitoring
- ✅ Error Handling
- ✅ Simple CLI Interface

## Demo Options

1. **Simple Chat Test** - Basic AI conversation
2. **Tone Testing** - Test different tones (gentle, warm, cheerful, quirky, delicate)
3. **Mode Testing** - Test different modes (empathy, analysis, suggestion, praise, playful)
4. **Token Usage Check** - Monitor token consumption and cost estimation
5. **Error Handling Test** - Test various error scenarios
6. **Interactive Chat** - Real-time conversation mode

## Quick Start

```bash
# Clone or download this demo
cd hua-demo

# Install dependencies
npm install

# Run the demo
npm start

# Or run tests
npm test
```

## Environment Variables

```bash
# Set your API key as environment variable
HUA_API_KEY=your-api-key node test.js
```

## API Configuration

Update the `baseURL` in `demo.js` and `test.js` to match your HUA API endpoint:

```javascript
const sdk = new HuaSDK(apiKey, {
  baseURL: 'https://api.hua.ai.kr' // Change to your actual domain
});
```

## Support

- 📧 Email: [echonet.ais@gmail.com](echonet.ais@gmail.com)
- 📖 Documentation: [API Documentation](https://api.hua.ai.kr/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/HUA-Labs/hua-api/issues)
- 📦 SDK: [npm package](https://www.npmjs.com/package/@hua/sdk-lite)

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**HUA Labs** - Emotion Recognition AI Chatbot API

---

[한국어 README](README.md) | [English README](README_EN.md)
