const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// API 프록시 설정
app.use('/api', createProxyMiddleware({
  target: 'https://api.hua.ai.kr',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug'
}));

app.listen(PORT, () => {
  console.log(`프록시 서버가 http://localhost:${PORT}에서 실행 중입니다`);
  console.log(`API 요청: http://localhost:${PORT}/api/lite`);
});
