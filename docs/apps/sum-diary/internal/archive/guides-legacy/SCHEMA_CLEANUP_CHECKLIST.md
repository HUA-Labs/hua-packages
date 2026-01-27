# 스키마 정리 체크리스트

> 작성일: 2025-12-16  
> 런칭 전 스키마 정리 작업 체크리스트

## 제거 대상 필드

### 1. `AnalysisResult.raw_ai_response` (Json)
- **위치**: `prisma/schema.prisma` - `AnalysisResult` 모델
- **이유**: 암호화된 `raw_ai_response_enc` 사용, 평문 저장 불필요
- **보안**: 평문 제거로 보안 강화

### 2. `User.image` (String?)
- **위치**: `prisma/schema.prisma` - `User` 모델
- **이유**: `profile_image` 필드로 통일
- **주의**: NextAuth 세션에서는 `profile_image`를 `image`로 매핑 필요

## 작업 체크리스트

### Phase 1: 코드 정리

#### `raw_ai_response` 제거
- [ ] `app/api/diary/analyze/stream/route.ts` - `raw_ai_response` 참조 제거
- [ ] `app/lib/analysis-service.ts` - `raw_ai_response` 참조 제거
- [ ] `app/api/diary/[id]/route.ts` - fallback 로직 제거
- [ ] `app/api/admin/diaries/[id]/route.ts` - `raw_ai_response` 참조 제거
- [ ] `app/api/admin/dashboard/route.ts` - `raw_ai_response` 참조 제거
- [ ] `app/lib/encryption.ts` - `raw_ai_response` 타입 제거
- [ ] `app/lib/ai-response-types.ts` - `raw_ai_response` 타입 제거
- [ ] `scripts/tests/test-sse-analysis.ts` - 테스트 코드 업데이트

#### `User.image` 제거
- [ ] `app/lib/auth.ts` - `image` 참조를 `profile_image`로 변경
- [ ] `app/components/layout/Header.tsx` - `image` 참조를 `profile_image`로 변경
- [ ] `app/components/layout/HeaderComponents/ProfilePopover.tsx` - `image` 참조를 `profile_image`로 변경
- [ ] `app/lib/user-encryption.ts` - `image` 필드 제거
- [ ] `app/hooks/profile/useProfileForm.ts` - `image` 참조 제거
- [ ] `app/types/api.ts` - `image` 타입 제거
- [ ] `app/api/user/profile/route.ts` - `image` 참조 제거
- [ ] `app/api/admin/users/route.ts` - `image` 참조 제거
- [ ] `app/admin/users/page.tsx` - `image` 참조 제거
- [ ] NextAuth 어댑터에서 `profile_image` → `image` 매핑 추가 (세션 레벨)

### Phase 2: 스키마 정리

- [ ] `prisma/schema.prisma`에서 `AnalysisResult.raw_ai_response` 필드 제거
- [ ] `prisma/schema.prisma`에서 `User.image` 필드 제거
- [ ] Prisma 클라이언트 재생성: `pnpm db:generate`
- [ ] 마이그레이션 생성: `pnpm db:migrate:local --name remove_unused_fields`
- [ ] 마이그레이션 SQL 확인
- [ ] 마이그레이션 실행: `pnpm db:push` (또는 `pnpm db:migrate:local deploy`)

### Phase 3: 테스트

- [ ] 모든 테스트 실행: `pnpm test` (있는 경우)
- [ ] 로그인/로그아웃 테스트 (NextAuth 동작 확인)
- [ ] 프로필 이미지 업로드/조회 테스트
- [ ] 일기 분석 결과 저장/조회 테스트
- [ ] 관리자 대시보드 분석 결과 조회 테스트

### Phase 4: 검증

- [ ] TypeScript 컴파일 오류 없음 확인
- [ ] ESLint 오류 없음 확인
- [ ] 개발 서버 정상 실행 확인
- [ ] 프로덕션 빌드 성공 확인: `pnpm build`

## 주의사항

1. **NextAuth 세션 매핑**
   - 데이터베이스에서는 `profile_image`만 저장
   - NextAuth 세션에서는 `image` 필드로 노출 (어댑터에서 매핑)

2. **기존 데이터**
   - 런칭 전이므로 기존 데이터 마이그레이션 불필요
   - 필요시 개발 데이터만 정리

3. **타입 안정성**
   - 모든 TypeScript 타입 정의 업데이트
   - Prisma 클라이언트 재생성 필수

## 예상 소요 시간

- 코드 정리: 1-2시간
- 스키마 정리: 30분
- 테스트: 1시간
- **총 예상 시간: 2.5-3.5시간**

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
