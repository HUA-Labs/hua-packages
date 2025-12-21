# 스키마 정리 제안

> 작성일: 2025-12-16  
> 사용하지 않는 필드 제거 및 스키마 정리 제안  
> **런칭 전이므로 하위 호환성 고려 불필요**

## 제거 가능한 필드

### 1. AnalysisResult.raw_ai_response (Json) ⭐ 즉시 제거 가능

**현재 상태:**
```prisma
raw_ai_response Json? // 하위 호환성 유지 (사용 안 함, nullable)
```

**사용 현황:**
- 일부 코드에서 fallback으로 사용 중
- 실제로는 `raw_ai_response_enc` (암호화된 필드) 사용
- 런칭 전이므로 하위 호환성 고려 불필요

**제거 전략:**
1. 코드에서 `raw_ai_response` 참조를 모두 `raw_ai_response_enc`로 변경
2. Prisma 스키마에서 필드 제거
3. 마이그레이션 실행

**제거 시기:** 
- 즉시 가능 (런칭 전)

### 2. User.image (NextAuth 호환성) ⭐ 즉시 제거 가능

**현재 상태:**
```prisma
image String? // NextAuth 호환성
profile_image String? // 실제 사용
```

**사용 현황:**
- `profile_image`가 실제 사용되는 필드
- `image`는 NextAuth 세션과의 호환성을 위해 사용
- 일부 코드에서 `user.image || user.profile_image` 패턴 사용

**제거 전략:**
1. 모든 코드에서 `image` 참조를 `profile_image`로 통일
2. NextAuth 어댑터에서 `profile_image`를 `image`로 매핑 (세션 레벨)
3. Prisma 스키마에서 필드 제거
4. 마이그레이션 실행

**제거 시기:**
- 즉시 가능 (런칭 전)

## 제안하는 정리 작업

### 1단계: 코드 정리 (즉시)
- [ ] `image` 참조를 `profile_image`로 통일
- [ ] `raw_ai_response` 참조를 `raw_ai_response_enc`로 전환
- [ ] NextAuth 어댑터에서 `profile_image` → `image` 매핑 (세션 레벨만)

### 2단계: 스키마 정리 (즉시)
- [ ] `AnalysisResult.raw_ai_response` 필드 제거
- [ ] `User.image` 필드 제거
- [ ] Prisma 마이그레이션 생성 및 실행

### 3단계: 테스트 (즉시)
- [ ] 모든 테스트 통과 확인
- [ ] NextAuth 세션 정상 동작 확인
- [ ] 분석 결과 저장/조회 정상 동작 확인

## 참고사항

1. **런칭 전 정리**
   - 아직 런칭 전이므로 하위 호환성 고려 불필요
   - 즉시 제거 가능

2. **NextAuth 호환성**
   - `User.image` 필드는 제거하되, NextAuth 세션에서는 `profile_image`를 `image`로 매핑
   - 어댑터 레벨에서 처리 (데이터베이스 스키마와 분리)

3. **보안**
   - `raw_ai_response` (평문) 제거는 보안 강화에 도움
   - 모든 민감 데이터는 암호화 필드(`*_enc`) 사용

4. **마이그레이션**
   - 기존 데이터가 있다면 마이그레이션 스크립트 작성
   - 런칭 전이므로 데이터 손실 우려 적음

## 상세 작업 체크리스트

자세한 작업 항목은 [스키마 정리 체크리스트](./SCHEMA_CLEANUP_CHECKLIST.md)를 참조하세요.

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
