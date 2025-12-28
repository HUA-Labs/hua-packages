# 0.1.0 버전 배포 체크리스트 / Deployment Checklist 0.1.0

## 배포 일자 / Release Date
2025-12-29

## 배포 대상 / Packages to Release
- [ ] @hua-labs/hua-ux (v0.1.0)
- [ ] create-hua-ux (v0.1.0)

---

## 배포 전 확인 / Pre-Release Checks

### 1. 빌드 확인 / Build Verification

#### @hua-labs/hua-ux
- [ ] `cd packages/hua-ux && pnpm run build` 성공 / Build succeeds
- [ ] `dist/` 폴더 생성 확인 / `dist/` folder created
- [ ] `dist/index.js` 파일 존재 / `dist/index.js` exists
- [ ] `dist/index.d.ts` 파일 존재 / `dist/index.d.ts` exists
- [ ] `dist/framework/index.js` 파일 존재 / `dist/framework/index.js` exists
- [ ] `dist/presets/index.js` 파일 존재 / `dist/presets/index.js` exists
- [ ] TypeScript 컴파일 에러 없음 / No TypeScript compilation errors

#### create-hua-ux
- [ ] `cd packages/create-hua-ux && pnpm run build` 성공 / Build succeeds
- [ ] `dist/` 폴더 생성 확인 / `dist/` folder created
- [ ] `dist/index.js` 파일 존재 / `dist/index.js` exists
- [ ] `dist/bin/create-hua-ux.js` 파일 존재 / `dist/bin/create-hua-ux.js` exists
- [ ] `dist/bin/create-hua-ux.js`에 shebang (`#!/usr/bin/env node`) 포함 / Shebang (`#!/usr/bin/env node`) included in `dist/bin/create-hua-ux.js`
- [ ] TypeScript 컴파일 에러 없음 / No TypeScript compilation errors

---

### 2. 테스트 확인 / Test Verification

#### 로컬 빌드 테스트 / Local Build Tests
- [ ] hua-ux 빌드 성공 / hua-ux build succeeds
- [ ] create-hua-ux 빌드 성공 / create-hua-ux build succeeds

#### 로컬 프로젝트 생성 테스트 / Local Project Creation Tests
- [ ] `node packages/create-hua-ux/dist/bin/create-hua-ux.js test-project` 성공 / Command succeeds
- [ ] 생성된 프로젝트 구조 확인 / Generated project structure verified
- [ ] 생성된 프로젝트의 `package.json`에 `@hua-labs/hua-ux: ^0.1.0` 포함 / Generated project's `package.json` includes `@hua-labs/hua-ux: ^0.1.0`
- [ ] 생성된 프로젝트의 `package.json`에 `workspace:*` 없음 (npm 버전 사용) / No `workspace:*` in generated project's `package.json` (uses npm version)
- [ ] 생성된 프로젝트에서 `pnpm install` 성공 / `pnpm install` succeeds in generated project
- [ ] 생성된 프로젝트에서 `pnpm run build` 성공 / `pnpm run build` succeeds in generated project
- [ ] 생성된 프로젝트에서 `pnpm dev` 실행 가능 (선택적) / `pnpm dev` runs in generated project (optional)

---

### 3. 문서 확인 / Documentation Verification

#### README
- [ ] `packages/hua-ux/README.md` 최신 상태 / Up to date
- [ ] `packages/create-hua-ux/README.md` 최신 상태 / Up to date
- [ ] 설치 방법 명시됨 / Installation instructions included
- [ ] 사용 예시 정확함 / Usage examples are accurate
- [ ] 링크가 모두 작동함 / All links work

#### CHANGELOG
- [ ] `packages/hua-ux/CHANGELOG.md`에 0.1.0 항목 존재 / 0.1.0 entry exists
- [ ] `packages/create-hua-ux/CHANGELOG.md`에 0.1.0 항목 존재 / 0.1.0 entry exists
- [ ] 날짜 정확함 (2025-12-29) / Date is accurate (2025-12-29)
- [ ] 주요 기능 나열됨 / Key features listed

#### 기타 문서 / Other Documents
- [ ] 프레임워크 README (`packages/hua-ux/src/framework/README.md`) 최신 상태 / Framework README is up to date
- [ ] npm 배포 가이드 (`packages/create-hua-ux/docs/NPM_PUBLISH_GUIDE.md`) 최신 상태 / npm publish guide is up to date

---

### 4. npm 설정 확인 / npm Configuration Verification

#### @hua-labs/hua-ux
- [ ] `package.json`의 `version`이 `0.1.0` / `version` is `0.1.0`
- [ ] `package.json`의 `name`이 `@hua-labs/hua-ux` / `name` is `@hua-labs/hua-ux`
- [ ] `package.json`의 `files` 필드에 `["dist", "src"]` 포함 / `files` field includes `["dist", "src"]`
- [ ] `package.json`의 `exports` 필드 설정 확인 / `exports` field verified
- [ ] `package.json`의 `peerDependencies`에 `react`, `react-dom` 포함 / `peerDependencies` includes `react`, `react-dom`
- [ ] `package.json`의 `repository` URL 정확함 / `repository` URL is accurate
- [ ] `package.json`의 `license`가 `MIT` / `license` is `MIT`
- [ ] `npm pack --dry-run` 실행하여 배포 파일 확인 / Run `npm pack --dry-run` to verify files to be published

#### create-hua-ux
- [ ] `package.json`의 `version`이 `0.1.0` / `version` is `0.1.0`
- [ ] `package.json`의 `name`이 `create-hua-ux` / `name` is `create-hua-ux`
- [ ] `package.json`의 `files` 필드에 `["dist", "templates"]` 포함 / `files` field includes `["dist", "templates"]`
- [ ] `package.json`의 `bin` 경로가 `dist/bin/create-hua-ux.js` / `bin` path is `dist/bin/create-hua-ux.js`
- [ ] `package.json`의 `main` 경로가 `dist/index.js` / `main` path is `dist/index.js`
- [ ] `package.json`의 `repository` URL 정확함 / `repository` URL is accurate
- [ ] `package.json`의 `license`가 `MIT` / `license` is `MIT`
- [ ] `npm pack --dry-run` 실행하여 배포 파일 확인 / Run `npm pack --dry-run` to verify files to be published
- [ ] `src/utils.ts`의 `getHuaUxVersion()` 함수가 `^0.1.0` 반환 / `getHuaUxVersion()` function in `src/utils.ts` returns `^0.1.0`

---

### 5. npm 계정 확인 / npm Account Verification

- [ ] `npm login` 완료 / `npm login` completed
- [ ] `npm whoami`로 계정 확인 / Account verified with `npm whoami`
- [ ] `@hua-labs` 스코프 접근 권한 확인 / `@hua-labs` scope access verified
- [ ] 2FA 활성화 여부 확인 (권장) / 2FA activation verified (recommended)

---

## 배포 실행 / Release Execution

### Step 1: @hua-labs/hua-ux 배포

- [ ] `cd packages/hua-ux`
- [ ] `npm publish --access public` 실행 / Run `npm publish --access public`
- [ ] 배포 성공 메시지 확인 / Release success message verified
- [ ] `npm view @hua-labs/hua-ux`로 확인 / Verify with `npm view @hua-labs/hua-ux`
- [ ] npm 레지스트리에서 패키지 페이지 확인 / Verify package page on npm registry

### Step 2: create-hua-ux 배포

- [ ] `cd packages/create-hua-ux`
- [ ] `npm publish --access public` 실행 / Run `npm publish --access public`
- [ ] 배포 성공 메시지 확인 / Release success message verified
- [ ] `npm view create-hua-ux`로 확인 / Verify with `npm view create-hua-ux`
- [ ] npm 레지스트리에서 패키지 페이지 확인 / Verify package page on npm registry

---

## 배포 후 확인 / Post-Release Verification

### 1. npm 레지스트리 확인 / npm Registry Verification

- [ ] https://www.npmjs.com/package/@hua-labs/hua-ux 접속 가능 / Accessible
- [ ] https://www.npmjs.com/package/create-hua-ux 접속 가능 / Accessible
- [ ] 패키지 페이지에 README 표시됨 / README displayed on package page
- [ ] 버전 정보 정확함 (0.1.0) / Version information is accurate (0.1.0)
- [ ] 의존성 정보 정확함 / Dependency information is accurate

### 2. 설치 테스트 / Installation Tests

#### @hua-labs/hua-ux 직접 설치 / Direct Installation
- [ ] `cd /tmp && mkdir test-hua-ux && cd test-hua-ux`
- [ ] `pnpm init -y`
- [ ] `pnpm add @hua-labs/hua-ux zustand` 성공 / Installation succeeds
- [ ] 패키지 import 테스트 성공 / Package import test succeeds

#### create-hua-ux CLI 테스트 / CLI Test
- [ ] `cd /tmp && rm -rf test-cli-project`
- [ ] `pnpm create hua-ux test-cli-project` 성공 / Command succeeds
- [ ] 생성된 프로젝트의 `package.json`에 `@hua-labs/hua-ux: ^0.1.0` 포함 / Generated project's `package.json` includes `@hua-labs/hua-ux: ^0.1.0`
- [ ] 생성된 프로젝트에서 `pnpm install` 성공 / `pnpm install` succeeds
- [ ] 생성된 프로젝트에서 `pnpm run build` 성공 / `pnpm run build` succeeds

### 3. 문서 확인 / Documentation Verification

- [ ] npm 패키지 페이지에 README 표시됨 / README displayed on npm package page
- [ ] 사용 가이드 정확함 / Usage guide is accurate
- [ ] 예제 코드 작동함 / Example code works

---

## 배포 후 작업 / Post-Release Tasks

### 1. GitHub Release

- [ ] Git 태그 생성: `git tag -a v0.1.0 -m "Release 0.1.0"` / Create Git tag
- [ ] 태그 푸시: `git push origin v0.1.0` / Push tag
- [ ] GitHub에서 Release 생성 / Create Release on GitHub
- [ ] Release 노트 작성 / Write release notes

### 2. 문서 업데이트 / Documentation Updates

- [ ] 개발로그 작성 (선택적) / Write devlog (optional)
- [ ] 사용자 가이드 업데이트 (필요시) / Update user guide (if needed)

### 3. 모니터링 / Monitoring

- [ ] npm 다운로드 통계 확인 / Check npm download statistics
- [ ] 사용자 피드백 수집 준비 / Prepare for user feedback collection

---

## 주의사항 / Important Notes

1. **배포 순서 / Release Order**: 반드시 `@hua-labs/hua-ux`를 먼저 배포해야 함 / Must release `@hua-labs/hua-ux` first
2. **버전 확인 / Version Verification**: 두 패키지 모두 `0.1.0` 버전인지 확인 / Verify both packages are version `0.1.0`
3. **빌드 확인 / Build Verification**: 배포 전 반드시 빌드 성공 확인 / Verify build succeeds before release
4. **테스트 확인 / Test Verification**: 배포 후 실제 설치 및 사용 테스트 필수 / Actual installation and usage tests required after release
5. **롤백 계획 / Rollback Plan**: 문제 발생 시 즉시 대응할 수 있도록 준비 / Prepare for immediate response if issues occur

---

## 롤백 절차 (필요시) / Rollback Procedure (If Needed)

### 패키지 제거 (24시간 이내) / Package Removal (Within 24 Hours)

```bash
# 패키지 제거 (배포 후 24시간 이내만 가능)
# Remove packages (only possible within 24 hours after release)
npm unpublish @hua-labs/hua-ux@0.1.0 --force
npm unpublish create-hua-ux@0.1.0 --force
```

**주의 / Warning:**
- 24시간 이후에는 패키지 제거 불가 / Package removal not possible after 24 hours
- 대신 새 버전 배포로 문제 해결 / Instead, release a new version to fix issues

### 새 버전 배포 / New Version Release

```bash
# 패치 버전으로 수정사항 배포
# Release fixes as patch version
cd packages/hua-ux
npm version patch  # 0.1.0 → 0.1.1
npm publish --access public

cd ../create-hua-ux
npm version patch  # 0.1.0 → 0.1.1
npm publish --access public
```

---

**체크리스트 작성일 / Written**: 2025-12-29  
**작성자 / Author**: HUA Platform 개발팀 / HUA Platform Development Team
