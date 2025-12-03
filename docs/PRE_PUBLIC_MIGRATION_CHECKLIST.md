# 퍼블릭 레포 이전 전 체크리스트

## ✅ 완료된 항목

1. ✅ 빌드 테스트
   - hua-i18n-core: 빌드 성공
   - hua-i18n-core-zustand: 빌드 성공
   - hua-i18n-loaders: 빌드 성공

2. ✅ 타입 체크
   - 모든 패키지 타입 체크 통과

3. ✅ 문서 영어화
   - README 영어화 완료
   - 내부 리뷰 문서는 한글 유지

## 🔧 개선 필요 사항

### 1. package.json 개선

#### hua-i18n-core
- [ ] `description` 영어로 변경: "HUA Labs - Core i18n functionality"
- [ ] `repository`, `bugs`, `homepage` 추가 (퍼블릭 레포 참조)

#### hua-i18n-core-zustand
- [ ] `description` 영어로 변경: "Zustand adapter for @hua-labs/i18n-core - Type-safe state management integration"
- [ ] `repository`, `bugs`, `homepage` 추가
- [ ] `workspace:*` 의존성 확인 (퍼블릭 레포에서도 workspace 사용하므로 유지 가능)

#### hua-i18n-loaders
- [ ] `main`, `types`를 `./dist/index.js`, `./dist/index.d.ts`로 변경 (현재 `./src/index.ts`)
- [ ] `repository`, `bugs`, `homepage` 추가
- [ ] `workspace:*` 의존성 확인

### 2. 불필요한 파일 제거

- [ ] `tsconfig.tsbuildinfo` 제거 (빌드 캐시)
- [ ] `.gitignore` 추가 (dist, node_modules, tsconfig.tsbuildinfo 등)

### 3. 퍼블릭 레포 구조 확인

- [ ] 퍼블릭 레포의 workspace 구조 확인
- [ ] README 업데이트 (i18n-core 패키지 추가)

## 📋 이전 순서

1. package.json 개선
2. 불필요한 파일 제거
3. 퍼블릭 레포로 복사
4. 퍼블릭 레포 README 업데이트
5. 빌드 테스트 (퍼블릭 레포에서)

