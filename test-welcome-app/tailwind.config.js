const path = require('path');

// Windows 경로를 POSIX 스타일로 변환 (Tailwind CSS 4 호환)
function toPosixPath(filePath) {
  return String(filePath).split(path.sep).join('/');
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    
    // 모노레포: 소스 코드 스캔
    toPosixPath(path.resolve(__dirname, '../../packages/hua-ux/src')) + '/**/*.{js,ts,jsx,tsx}',
    toPosixPath(path.resolve(__dirname, '../../packages/hua-ui/src')) + '/**/*.{js,ts,jsx,tsx}',
    
    // npm 배포: dist 폴더 우선 스캔
    toPosixPath(path.resolve(__dirname, './node_modules/@hua-labs/hua-ux/dist')) + '/**/*.{js,mjs}',
    toPosixPath(path.resolve(__dirname, './node_modules/@hua-labs/ui/dist')) + '/**/*.{js,mjs}',
    
    // Fallback: 전체 패키지 스캔
    toPosixPath(path.resolve(__dirname, './node_modules/@hua-labs/hua-ux')) + '/**/*.{js,ts,jsx,tsx,mjs}',
    toPosixPath(path.resolve(__dirname, './node_modules/@hua-labs/ui')) + '/**/*.{js,ts,jsx,tsx,mjs}',
    toPosixPath(path.resolve(__dirname, './node_modules/@hua-labs')) + '/**/*.{js,ts,jsx,tsx,mjs}',
  ],
  safelist: [
    // 동적으로 생성되는 클래스만 추가
  ],
}
