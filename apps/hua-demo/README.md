# SUM API Demo Collection

A comprehensive collection of demos for testing the SUM API (HUA API) - an emotion recognition AI chatbot service. This repository includes both web and CLI demos showcasing the API's capabilities.

## 📦 Demo Collection

### 🌐 Web Demo (`hua-demo-clean/`)

A modern, responsive web application for testing SUM API with beautiful UI/UX.

**Features:**

- 🎯 Real-time API testing with live responses
- 🤖 Dual mode support (mock responses + real AI)
- 📱 Responsive design for all devices
- 🌍 Multi-language support (English/Korean)
- ⚙️ Flexible configuration options
- 🔒 Secure API key management
- ♿ Full accessibility support

**Quick Start:**

```bash
cd hua-demo-clean
npm install
npm run dev
```

### 💻 CLI Demo (`cli-demo/`)

Command-line interface demo for developers and automation.

**Features:**

- 🚀 Fast command-line testing
- 📊 Batch processing capabilities
- 🔧 Easy integration for scripts
- 🌍 Multi-language support
- 📝 Detailed logging and output

**Quick Start:**

```bash
cd cli-demo
npm install
node demo.js
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 2.0.0 or higher
- A SUM API key (get one at [hua.ai.kr](https://hua.ai.kr))

### Choose Your Demo

#### For Web Interface

```bash
# Navigate to web demo
cd hua-demo-clean

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173
```

#### For Command Line

```bash
# Navigate to CLI demo
cd cli-demo

# Install dependencies
npm install

# Run English demo
node demo.js

# Run Korean demo
node demo_ko.js

# Run test script
node test.js
```

## 🎮 How to Use

### 1. Get Your API Key

- Visit [hua.ai.kr](https://hua.ai.kr) to sign up and get your SUM API key
- The API key is required for all requests

### 2. Configure Settings

#### Web Demo Configuration

- **API Key**: Enter your SUM API key
- **LLM Key** (Optional): Add your OpenAI API key for real AI responses
- **Server URL**: Default is `https://api.hua.ai.kr`
- **Language**: Choose between English and Korean
- **Tier**: Select response quality (1-3)
- **Tone**: Choose response style (gentle, warm, cheerful, quirky, delicate)
- **Mode**: Select interaction type (empathy, analysis, suggestion, praise, playful)

#### CLI Demo Configuration

Edit the configuration in your demo file:

```javascript
const config = {
  apiKey: 'your-my-api-key',
  llmKey: 'your-openai-key', // optional
  baseURL: 'https://api.hua.ai.kr',
  language: 'en', // 'en' or 'ko'
  tier: '3',
  tone: 'gentle',
  mode: 'empathy'
};
```

### 3. Start Testing

- **Web Demo**: Use the intuitive interface to chat with AI
- **CLI Demo**: Run scripts for automated testing and batch processing

## 🔧 Configuration Options

### Provider Modes

- **Mock Mode**: Uses predefined responses (no LLM key required)
- **OpenAI Mode**: Real AI responses using your OpenAI API key
- **Gemini Mode**: Real AI responses using Google's Gemini (coming soon)

### Response Tiers

- **Tier 1**: Short, concise responses
- **Tier 2**: Medium-length, balanced responses  
- **Tier 3**: Long, detailed responses

### Tone Options

- **Gentle**: Soft, caring responses
- **Warm**: Friendly, encouraging responses
- **Cheerful**: Energetic, positive responses
- **Quirky**: Playful, humorous responses
- **Delicate**: Sensitive, thoughtful responses

### Mode Options

- **Empathy**: Understanding and supportive
- **Analysis**: Analytical and logical
- **Suggestion**: Practical advice and solutions
- **Praise**: Encouraging and motivational
- **Playful**: Fun and entertaining

## 🛠️ Development

### Web Demo Development

```bash
cd hua-demo-clean
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### CLI Demo Development

```bash
cd cli-demo
node demo.js         # Run English demo
node demo_ko.js      # Run Korean demo
node test.js         # Run test script
```

### Tech Stack

#### Web Demo

- **Frontend**: React 19.1.0 + TypeScript 5.8.3
- **Build Tool**: Vite 4.5.0
- **Styling**: Tailwind CSS 3.4.3
- **Linting**: ESLint 9.30.1
- **Package Manager**: npm 2.0.0+

#### CLI Demo

- **Runtime**: Node.js
- **SDK**: @hua-labs/api-lite 2.1.2
- **Package Manager**: npm

## 🌐 API Endpoints

All demos connect to the SUM API at `https://api.hua.ai.kr/api/lite` with the following features:

- **Authentication**: Bearer token with your SUM API key
- **Request Format**: JSON with message, language, tier, tone, mode, and provider
- **Response Format**: JSON with AI response, usage stats, and metadata
- **Rate Limiting**: Based on your subscription tier
- **CORS**: Configured for web browser access

## 📱 Browser Support (Web Demo)

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [API Documentation](https://docs.hua.ai.kr)
- **Website**: [hua.ai.kr](https://hua.ai.kr)
- **Issues**: Report bugs and feature requests via GitHub Issues

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Designed for developer experience and ease of use
- Optimized for both web and CLI environments
- Full accessibility support for inclusive development

---

> **💻 Optimized for PC Mode - Best experienced in full-screen**
