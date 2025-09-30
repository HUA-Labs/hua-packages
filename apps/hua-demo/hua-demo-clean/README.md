# SUM API Demo - Emotion Recognition AI Chatbot

A modern, responsive web demo for testing the SUM API (HUA API) - an emotion recognition AI chatbot service. This demo showcases the API's capabilities with both mock responses and real AI interactions.

## ✨ Features

- **🎯 Real-time API Testing** - Test SUM API endpoints with live responses
- **🤖 Dual Mode Support** - Switch between mock responses and real AI (OpenAI/Gemini)
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🎨 Modern UI/UX** - Beautiful glass-morphism design with smooth animations
- **🌍 Multi-language** - Support for English and Korean responses
- **⚙️ Flexible Configuration** - Customize tone, mode, tier, and language settings
- **📊 Usage Tracking** - Real-time display of API usage and credits
- **🔒 Secure** - API key management with proper authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 2.0.0 or higher
- A SUM API key (get one at [hua.ai.kr](https://hua.ai.kr))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hua-demo/hua-demo-clean
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎮 How to Use

### 1. Get Your API Key

- Visit [hua.ai.kr](https://hua.ai.kr) to sign up and get your SUM API key
- The API key is required for all requests

### 2. Configure Settings

- **API Key**: Enter your SUM API key
- **LLM Key** (Optional): Add your OpenAI API key for real AI responses
- **Server URL**: Default is `https://api.hua.ai.kr`
- **Language**: Choose between English and Korean
- **Tier**: Select response quality (1-3)
- **Tone**: Choose response style (gentle, warm, cheerful, quirky, delicate)
- **Mode**: Select interaction type (empathy, analysis, suggestion, praise, playful)

### 3. Start Chatting

- Type your message in the input field
- Press Enter to send or Shift+Enter for new line
- Each message is processed independently (no conversation memory)

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

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Tech Stack

- **Frontend**: React 19.1.0 + TypeScript 5.8.3
- **Build Tool**: Vite 4.5.0
- **Styling**: Tailwind CSS 3.4.3
- **Linting**: ESLint 9.30.1
- **Package Manager**: npm 2.0.0+

### Project Structure

```text
hua-demo-clean/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🌐 API Endpoints

The demo connects to the SUM API at `https://api.hua.ai.kr/api/lite` with the following features:

- **Authentication**: Bearer token with your SUM API key
- **Request Format**: JSON with message, language, tier, tone, mode, and provider
- **Response Format**: JSON with AI response, usage stats, and metadata
- **Rate Limiting**: Based on your subscription tier
- **CORS**: Configured for web browser access

## 📱 Browser Support

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
- Optimized for PC mode with full-screen experience

---

> **💻 Optimized for PC Mode - Best experienced in full-screen**
