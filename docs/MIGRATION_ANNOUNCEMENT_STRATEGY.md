# HUA Platform - 마이그레이션 안내 전략

## 🎯 **기존 SDK → 새로운 스코프 패키지 마이그레이션**

### **현재 상황**
- **@hua-labs/i18n-sdk** - `1.2.2` (기존 통합 패키지)
- **새로운 스코프 패키지들** - 도메인별 분리

### **마이그레이션 목표**
- 기존 사용자들이 새로운 패키지로 자연스럽게 이동
- 하위 호환성 유지하면서 점진적 전환
- 명확한 마이그레이션 가이드 제공

## 📦 **패키지 매핑**

### **기존 → 새로운 매핑**
```bash
# 기존 통합 패키지
@hua-labs/i18n-sdk

# 새로운 도메인별 패키지들
@hua-labs/i18n-core      # 핵심 기능
@hua-labs/i18n-beginner  # 초보자용
@hua-labs/i18n-advanced  # 고급자용
@hua-labs/i18n-ai        # AI 기능
@hua-labs/i18n-debug     # 디버그 도구
@hua-labs/i18n-plugins   # 플러그인 시스템
```

## 🚨 **Deprecation 전략**

### **1단계: 경고 메시지 추가**
```typescript
// @hua-labs/i18n-sdk의 각 엔트리포인트에 경고 추가
export function useTranslation() {
  console.warn(`
🚨 DEPRECATION WARNING 🚨
@hua-labs/i18n-sdk is deprecated and will be removed in v2.0.0

Please migrate to the new domain-specific packages:

📦 For beginners:
   npm install @hua-labs/i18n-beginner
   import { useTranslation } from '@hua-labs/i18n-beginner'

📦 For advanced users:
   npm install @hua-labs/i18n-advanced
   import { useTranslation } from '@hua-labs/i18n-advanced'

📦 For core functionality:
   npm install @hua-labs/i18n-core
   import { useTranslation } from '@hua-labs/i18n-core'

🔗 Migration guide: https://github.com/HUA-Labs/hua-platform#migration
  `);
  
  // 기존 로직 실행
  return originalUseTranslation();
}
```

### **2단계: README 업데이트**
```markdown
# @hua-labs/i18n-sdk

> **🚨 DEPRECATED: This package is deprecated and will be removed in v2.0.0**

## 🔄 Migration Required

This package has been split into domain-specific packages for better maintainability and flexibility.

### 📦 New Packages

| Use Case | New Package | Installation |
|----------|-------------|--------------|
| **Beginner** | `@hua-labs/i18n-beginner` | `npm install @hua-labs/i18n-beginner` |
| **Advanced** | `@hua-labs/i18n-advanced` | `npm install @hua-labs/i18n-advanced` |
| **Core** | `@hua-labs/i18n-core` | `npm install @hua-labs/i18n-core` |
| **AI Features** | `@hua-labs/i18n-ai` | `npm install @hua-labs/i18n-ai` |
| **Debug Tools** | `@hua-labs/i18n-debug` | `npm install @hua-labs/i18n-debug` |
| **Plugins** | `@hua-labs/i18n-plugins` | `npm install @hua-labs/i18n-plugins` |

### 🔄 Quick Migration

**Before:**
```typescript
import { useTranslation } from '@hua-labs/i18n-sdk'
```

**After:**
```typescript
// For beginners
import { useTranslation } from '@hua-labs/i18n-beginner'

// For advanced users
import { useTranslation } from '@hua-labs/i18n-advanced'

// For core functionality
import { useTranslation } from '@hua-labs/i18n-core'
```

### 📚 Migration Guide

- [Complete Migration Guide](./docs/MIGRATION_GUIDE.md)
- [Migration Examples](./docs/MIGRATION_EXAMPLES.md)
- [FAQ](./docs/MIGRATION_FAQ.md)

### ⏰ Timeline

- **v1.2.x**: Deprecation warnings (current)
- **v1.3.x**: Enhanced warnings + migration tools
- **v2.0.0**: Package removal (estimated: Q2 2025)

### 🆘 Need Help?

- [GitHub Issues](https://github.com/HUA-Labs/hua-platform/issues)
- [Migration Support](https://github.com/HUA-Labs/hua-platform/discussions)
- [Community Discord](https://discord.gg/hua-labs)
```

## 🔄 **마이그레이션 도구**

### **1. 자동 마이그레이션 스크립트**
```bash
# 마이그레이션 도구 설치
npm install -g @hua-labs/migrate-i18n

# 자동 마이그레이션 실행
migrate-i18n --from @hua-labs/i18n-sdk --to @hua-labs/i18n-beginner
```

### **2. ESLint 규칙**
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@hua-labs/i18n-sdk"],
            "message": "🚨 @hua-labs/i18n-sdk is deprecated. Please migrate to domain-specific packages. See: https://github.com/HUA-Labs/hua-platform#migration"
          }
        ]
      }
    ]
  }
}
```

### **3. TypeScript 경고**
```typescript
// @deprecated 태그 추가
/**
 * @deprecated This package is deprecated. Use @hua-labs/i18n-beginner instead.
 * @see https://github.com/HUA-Labs/hua-platform#migration
 */
export function useTranslation() {
  // ...
}
```

## 📅 **타임라인**

### **Phase 1: 경고 시작 (현재)**
- Deprecation 경고 메시지 추가
- README 업데이트
- 마이그레이션 가이드 작성

### **Phase 2: 강화된 경고 (v1.3.x)**
- 더 강력한 경고 메시지
- 자동 마이그레이션 도구 출시
- ESLint 규칙 제공

### **Phase 3: 패키지 제거 (v2.0.0)**
- 기존 패키지 완전 제거
- 새로운 스코프 패키지만 유지
- 마이그레이션 완료

## 🎯 **사용자 안내 전략**

### **1. 점진적 전환**
```bash
# 1단계: 경고 메시지로 인지
# 2단계: 새로운 패키지 설치
npm install @hua-labs/i18n-beginner

# 3단계: import 경로 변경
# 4단계: 기존 패키지 제거
npm uninstall @hua-labs/i18n-sdk
```

### **2. 명확한 가이드**
- 단계별 마이그레이션 가이드
- 예제 코드 제공
- FAQ 섹션

### **3. 지원 제공**
- GitHub Issues로 질문 응답
- Discord 커뮤니티 지원
- 마이그레이션 도구 제공

## 💡 **성공 지표**

### **목표**
- **6개월 내**: 80% 사용자가 새로운 패키지로 마이그레이션
- **1년 내**: 기존 패키지 사용률 5% 이하
- **v2.0.0**: 기존 패키지 완전 제거

### **측정 방법**
- npm 다운로드 통계
- GitHub Issues 분석
- 커뮤니티 피드백

---

**마지막 업데이트**: 2025년 1월
**상태**: 마이그레이션 전략 수립 완료 ✅ 