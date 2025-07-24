# HUA Platform - 스코프 기반 퍼블리시 전략

## 🎯 **스코프 분리의 진짜 이유**

### **패키지 확장성**
- **현재**: 15개 패키지
- **미래**: 더 많은 패키지 예상
- **스코프 분리**: 각 도메인별로 독립적인 패키지 관리

### **도메인별 분리**
```bash
# i18n 도메인 (6개 패키지)
@hua-labs/i18n-core
@hua-labs/i18n-beginner
@hua-labs/i18n-advanced
@hua-labs/i18n-ai
@hua-labs/i18n-debug
@hua-labs/i18n-plugins

# UI 도메인 (2개 패키지)
@hua-labs/ui
@hua-labs/animation

# 유틸리티 도메인 (4개 패키지)
@hua-labs/utils
@hua-labs/hooks
@hua-labs/config
@hua-labs/types

# 기타 도메인 (3개 패키지)
@hua-labs/labs
@hua-labs/i18n-sdk (이미 퍼블리시됨)
@hua-labs/api-lite (이미 퍼블리시됨)
```

## 🚀 **스코프 기반 퍼블리시 전략**

### **핵심 아이디어**
- **도메인별 스코프 분리 유지**
- **각 패키지를 독립적으로 퍼블리시**
- **모노레포에서 개발, 개별 퍼블리시**

### **장점**
1. **확장성**: 새로운 패키지 추가 용이
2. **독립성**: 각 패키지가 독립적으로 버전 관리
3. **선택적 설치**: 필요한 패키지만 설치 가능
4. **도메인 분리**: 기능별로 명확한 구분

## 📦 **퍼블리시 우선순위**

### **🔥 1순위: 핵심 SDK들**
```bash
# 범용성이 높은 패키지들
@hua-labs/animation     # React, Vue, 바닐라 JS 지원
@hua-labs/ui            # UI 컴포넌트 라이브러리
@hua-labs/utils         # 공통 유틸리티
@hua-labs/hooks         # 공통 React 훅
```

### **🔥 2순위: i18n 도메인**
```bash
# i18n 기능별 분리
@hua-labs/i18n-core     # 핵심 기능
@hua-labs/i18n-beginner # 초보자용
@hua-labs/i18n-advanced # 고급자용
@hua-labs/i18n-ai       # AI 기능
@hua-labs/i18n-debug    # 디버그 도구
@hua-labs/i18n-plugins  # 플러그인 시스템
```

### **🔥 3순위: 기타 도메인**
```bash
# 설정 및 타입
@hua-labs/config        # 공통 설정
@hua-labs/types         # 공통 타입
@hua-labs/labs          # 실험실
```

## 🔄 **실행 계획**

### **1단계: 1순위 패키지 퍼블리시**
```bash
# 애니메이션 SDK
cd packages/hua-animation
npm publish

# UI SDK
cd packages/hua-ui
npm publish

# 유틸리티
cd packages/hua-utils
npm publish

# 훅
cd packages/hua-hooks
npm publish
```

### **2단계: i18n 도메인 퍼블리시**
```bash
# i18n 핵심
cd packages/hua-i18n-core
npm publish

# i18n 초보자용
cd packages/hua-i18n-beginner
npm publish

# i18n 고급자용
cd packages/hua-i18n-advanced
npm publish

# i18n AI
cd packages/hua-i18n-ai
npm publish

# i18n 디버그
cd packages/hua-i18n-debug
npm publish

# i18n 플러그인
cd packages/hua-i18n-plugins
npm publish
```

### **3단계: 기타 도메인 퍼블리시**
```bash
# 설정
cd packages/hua-config
npm publish

# 타입
cd packages/hua-types
npm publish

# 실험실
cd packages/hua-labs
npm publish
```

## 📁 **최종 패키지 구조**

### **퍼블리시 후**
```bash
# npm에서 설치 가능한 패키지들
npm install @hua-labs/animation
npm install @hua-labs/ui
npm install @hua-labs/utils
npm install @hua-labs/hooks
npm install @hua-labs/i18n-core
npm install @hua-labs/i18n-beginner
npm install @hua-labs/i18n-advanced
npm install @hua-labs/i18n-ai
npm install @hua-labs/i18n-debug
npm install @hua-labs/i18n-plugins
npm install @hua-labs/config
npm install @hua-labs/types
npm install @hua-labs/labs
```

## 🎯 **사용 시나리오**

### **시나리오 1: 애니메이션만 필요**
```bash
npm install @hua-labs/animation
```

### **시나리오 2: UI 컴포넌트만 필요**
```bash
npm install @hua-labs/ui
```

### **시나리오 3: i18n 초보자용만 필요**
```bash
npm install @hua-labs/i18n-beginner
```

### **시나리오 4: 전체 플랫폼**
```bash
npm install @hua-labs/animation @hua-labs/ui @hua-labs/utils @hua-labs/hooks
```

## 💡 **이 전략의 장점**

### **✅ 확장성**
- 새로운 패키지 추가 용이
- 도메인별 독립적 관리
- 선택적 설치 가능

### **✅ 유연성**
- 필요한 패키지만 설치
- 번들 크기 최적화
- 의존성 최소화

### **✅ 관리성**
- 각 패키지 독립적 버전 관리
- 도메인별 명확한 구분
- 문제 격리 용이

---

**마지막 업데이트**: 2025년 1월
**상태**: 스코프 기반 전략 수립 완료 ✅ 