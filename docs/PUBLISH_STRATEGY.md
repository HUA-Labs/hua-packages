# HUA Platform - 모노레포 퍼블리시 전략

## 🎯 **퍼블리시 전략: 개별 패키지 방식**

### **현재 상황**
- **모노레포**: `hua-platform` (개발용)
- **퍼블리시 대상**: `@hua-labs/animation`, `@hua-labs/ui`
- **사이트 배포**: `hua-animation-site`, `hua-ui-site`

### **1단계: GitHub 리포 분리**

#### **@hua-labs/animation 리포 생성**
```bash
# 1. GitHub에서 새 리포 생성: hua-animation
# 2. 패키지 파일들을 새 리포로 복사
# 3. package.json 수정 (독립 패키지로)
```

#### **@hua-labs/ui 리포 생성**
```bash
# 1. GitHub에서 새 리포 생성: hua-ui
# 2. 패키지 파일들을 새 리포로 복사
# 3. package.json 수정 (독립 패키지로)
```

### **2단계: 패키지 독립화**

#### **@hua-labs/animation 독립화**
```json
{
  "name": "@hua-labs/animation",
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/HUA-Labs/hua-animation"
  },
  "homepage": "https://github.com/HUA-Labs/hua-animation#readme",
  "bugs": {
    "url": "https://github.com/HUA-Labs/hua-animation/issues"
  }
}
```

#### **@hua-labs/ui 독립화**
```json
{
  "name": "@hua-labs/ui",
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/HUA-Labs/hua-ui"
  },
  "homepage": "https://github.com/HUA-Labs/hua-ui#readme",
  "bugs": {
    "url": "https://github.com/HUA-Labs/hua-ui/issues"
  }
}
```

### **3단계: npm 퍼블리시**

#### **애니메이션 SDK 퍼블리시**
```bash
cd hua-animation
npm login
npm publish
```

#### **UI SDK 퍼블리시**
```bash
cd hua-ui
npm login
npm publish
```

### **4단계: 사이트 배포**

#### **Vercel 배포**
- **hua-animation-site**: Vercel 연결 → 배포
- **hua-ui-site**: Vercel 연결 → 배포

## 🔄 **개발 워크플로우**

### **개발 시**
```bash
# 모노레포에서 개발
cd hua-platform
pnpm dev
```

### **퍼블리시 시**
```bash
# 개별 리포에서 퍼블리시
cd hua-animation
npm version patch
npm publish

cd hua-ui
npm version patch
npm publish
```

### **사이트 업데이트 시**
```bash
# Vercel에서 자동 배포
git push origin main
```

## 📦 **패키지 구조**

### **@hua-labs/animation**
```
hua-animation/
├── src/
│   ├── hooks/
│   ├── core/
│   └── index.ts
├── dist/
├── README.md
├── VUE_MIGRATION_GUIDE.md
├── VANILLA_JS_GUIDE.md
├── package.json
└── tsconfig.json
```

### **@hua-labs/ui**
```
hua-ui/
├── src/
│   ├── components/
│   └── index.ts
├── dist/
├── README.md
├── package.json
└── tsconfig.json
```

## 🌐 **사이트 구조**

### **hua-animation-site**
- **도메인**: `animation.hua-labs.com` (예시)
- **내용**: 애니메이션 SDK 문서, 예제, 벤치마크
- **기술**: Next.js 14, React 18

### **hua-ui-site**
- **도메인**: `ui.hua-labs.com` (예시)
- **내용**: UI 컴포넌트 문서, 플레이그라운드
- **기술**: Next.js 15, React 19

## ⚡ **빠른 시작 가이드**

### **1. GitHub 리포 생성**
```bash
# GitHub에서 새 리포 생성
# - hua-animation
# - hua-ui
```

### **2. 패키지 파일 복사**
```bash
# 각 패키지 폴더를 새 리포로 복사
# package.json 수정 (독립 패키지로)
```

### **3. npm 퍼블리시**
```bash
npm login
npm publish
```

### **4. Vercel 배포**
```bash
# GitHub 리포를 Vercel에 연결
# 자동 배포 설정
```

## 🎉 **퍼블리시 완료 후**

### **npm 패키지**
- `npm install @hua-labs/animation`
- `npm install @hua-labs/ui`

### **사이트 접속**
- 애니메이션 문서: `https://animation.hua-labs.com`
- UI 문서: `https://ui.hua-labs.com`

---

**마지막 업데이트**: 2025년 1월
**상태**: 전략 수립 완료 ✅ 