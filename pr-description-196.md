## 변경 사항

- [ ] 새로운 기능 추가
- [x] 버그 수정
- [ ] 코드 리팩토링
- [ ] 문서 수정
- [ ] 성능 개선
- [ ] 기존 API 업데이트
- [ ] 설정 변경
- [ ] 기타 (설명 필요)

## 브랜치 정보

- **Base 브랜치**: `main`
- **Head 브랜치**: `fix/packages/hua-ux/add-config-entry-point-for-server-compatibility`

## Breaking Changes

- [x] Breaking Changes 없음
- [ ] Breaking Changes 있음 (아래 설명)

## 변경 이유

Next.js 15의 서버 컴포넌트에서 `defineConfig`를 사용할 때 발생하는 에러를 해결하기 위해, `defineConfig`를 `'use client'` 지시어의 영향에서 분리한 별도의 entry point를 추가합니다.

`framework/index.ts`에 `'use client'` 지시어가 있어서, 이 파일에서 export되는 모든 함수가 클라이언트 전용으로 인식됩니다. 하지만 `hua-ux.config.ts`와 같은 설정 파일은 서버 사이드에서 실행되어야 하므로, 별도의 entry point가 필요합니다.

## 변경 내용 상세

### 변경된 파일
- `packages/hua-ux/src/framework/config.ts` (신규)
- `packages/hua-ux/package.json` (export 추가)

### 주요 변경사항

1. **별도 Entry Point 추가**
   - `packages/hua-ux/src/framework/config.ts` 파일 생성
   - `'use client'` 지시어 없이 `defineConfig` 및 관련 함수들을 export
   - 서버/클라이언트 모두에서 사용 가능

2. **Package.json Export 추가**
   - `./framework/config` entry point 추가
   - TypeScript 타입 정의 포함
   - `dist/framework/config.js`로 빌드된 파일을 export

3. **사용 방법**
   ```ts
   // hua-ux.config.ts (서버 사이드)
   import { defineConfig } from "@hua-labs/hua-ux/framework/config";
   
   export default defineConfig({
     preset: "marketing",
     // ...
   });
   ```

## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트 코딩 컨벤션을 따릅니다
- [x] 자기 코드 리뷰를 수행했습니다
- [x] 코드에 주석을 추가했습니다 (특히 복잡한 부분)
- [ ] 문서를 업데이트했습니다 (필요한 경우)

### 타입 및 빌드
- [ ] TypeScript 타입 체크 통과
- [ ] 빌드 성공 확인

### 테스트
- [ ] 테스트 코드 작성 (필요한 경우)
- [ ] 기존 테스트 통과

## 참고

- 이 변경사항은 PR #193 (`apps/hua-website`)에서 사용됩니다
- `framework/index.ts`에서의 export는 기존과 동일하게 유지됩니다 (하위 호환성)
- 클라이언트 컴포넌트에서는 여전히 `@hua-labs/hua-ux/framework`에서 `defineConfig`를 import할 수 있습니다
