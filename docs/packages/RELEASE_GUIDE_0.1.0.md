# 0.1.0 버전 배포 가이드 / Release Guide 0.1.0

## 배포 일자 / Release Date
2025-12-29

## 배포 대상 패키지 / Packages to Release

1. **@hua-labs/hua-ux** (v0.1.0) - 프레임워크 패키지 / Framework package
2. **create-hua-ux** (v0.1.0) - CLI 스캐폴딩 도구 / CLI scaffolding tool

## 배포 목표 / Release Goals

- hua-ux 프레임워크의 첫 공식 npm 배포 / First official npm release of hua-ux framework
- `pnpm create hua-ux` 명령어로 프로젝트 생성 가능하도록 설정 / Enable project creation via `pnpm create hua-ux` command
- 사용자가 5분 안에 hua-ux 프로젝트를 시작할 수 있도록 지원 / Enable users to start hua-ux projects within 5 minutes

---

## 저장소 전략 / Repository Strategy

### 현재 상황 / Current Status

현재 저장소는 `HUA-Labs/HUA-Labs-public`으로 설정되어 있으나, 실제로는 프라이빗 레포일 수 있습니다.

### npm 배포 옵션 / npm Publishing Options

#### 옵션 1: 프라이빗 레포에서 배포 (현재 가능) / Option 1: Publish from Private Repo (Currently Available)

**장점 / Pros:**
- 즉시 배포 가능 / Can publish immediately
- 코드베이스 구조 유지 / Maintain current codebase structure
- `npm publish --access public`로 공개 패키지 배포 가능 / Can publish public packages with `npm publish --access public`

**단점 / Cons:**
- 공개 패키지인데 프라이빗 레포에 있으면 투명성 부족 / Lack of transparency for public packages in private repo
- 커뮤니티 기여 어려움 / Difficult for community contributions
- npm 패키지 페이지에서 소스 코드 링크가 작동하지 않음 / Source code links on npm package page do not work
- 문서 백링크(backlinks) 및 GitHub 링크가 작동하지 않음 / Documentation backlinks and GitHub links do not work
- 사용자가 소스 코드를 직접 확인할 수 없음 / Users cannot directly view source code

#### 옵션 2: 퍼블릭 레포로 이관 (권장) / Option 2: Migrate to Public Repo (Recommended)

**장점 / Pros:**
- 공개 패키지에 적합 / Suitable for public packages
- 커뮤니티 기여 용이 / Easy for community contributions
- 투명성 및 신뢰성 향상 / Improved transparency and trust
- npm 패키지 페이지에서 소스 코드 링크 정상 작동 / Source code links work properly on npm package page

**단점 / Cons:**
- 레포 이관 작업 필요 / Requires repository migration work
- 공개/프라이빗 코드 분리 필요 / Need to separate public/private code

### 권장 사항 / Recommendation

**npm 패키지는 프라이빗 레포에서도 공개로 배포 가능하지만, 문서 백링크와 소스 코드 링크가 제대로 작동하려면 퍼블릭 레포가 필요합니다.**

**While npm packages can be published publicly from a private repository, a public repository is required for documentation backlinks and source code links to work properly.**

**따라서 공개 npm 패키지로 배포하는 경우 퍼블릭 레포로 이관을 권장합니다.**

**Therefore, migrating to a public repository is recommended when publishing public npm packages.**

**이관 시 고려사항 / Migration Considerations:**
- 공개할 패키지만 퍼블릭 레포로 이동 / Move only packages to be published to public repo
- 비즈니스 앱(`my-app`, `my-api` 등)은 프라이빗 레포 유지 / Keep business apps (`my-app`, `my-api`, etc.) in private repo
- 모노레포 구조 유지 가능 (GitHub의 public monorepo 지원) / Can maintain monorepo structure (GitHub supports public monorepos)

---

## 사전 준비 / Prerequisites

### 1. npm 계정 설정

```bash
# npm 로그인
npm login

# 계정 확인
npm whoami

# 조직 확인 (필요시)
npm org ls @hua-labs
```

**확인 사항 / Checklist:**
- [ ] npm 계정 로그인 완료 / npm account login completed
- [ ] `@hua-labs` 스코프 접근 권한 확인 / `@hua-labs` scope access verified
- [ ] 2FA 활성화 여부 확인 (권장) / 2FA activation verified (recommended)

### 2. 빌드 환경 확인

```bash
# 루트 디렉토리에서
pnpm install

# hua-ux 빌드
cd packages/hua-ux
pnpm run build

# create-hua-ux 빌드
cd ../create-hua-ux
pnpm run build
```

**확인 사항 / Checklist:**
- [ ] 모든 의존성 설치 완료 / All dependencies installed
- [ ] 빌드 에러 없음 / No build errors
- [ ] `dist/` 폴더 생성 확인 / `dist/` folder created

### 3. 버전 확인

```bash
# hua-ux 버전 확인
cat packages/hua-ux/package.json | grep '"version"'

# create-hua-ux 버전 확인
cat packages/create-hua-ux/package.json | grep '"version"'
```

**확인 사항 / Checklist:**
- [ ] 두 패키지 모두 `0.1.0` 버전 / Both packages are version `0.1.0`
- [ ] CHANGELOG에 0.1.0 항목 존재 / 0.1.0 entry exists in CHANGELOG

---

## 배포 순서 / Release Order

**중요 / Important:** 반드시 순서대로 배포해야 합니다. / Must be released in order.

### Step 1: @hua-labs/hua-ux 배포

`create-hua-ux`가 `@hua-labs/hua-ux`에 의존하므로 먼저 배포해야 합니다.

#### 1.1 배포 전 최종 확인

```bash
cd packages/hua-ux

# 빌드 확인
pnpm run build

# 배포할 파일 확인
npm pack --dry-run

# package.json 확인
cat package.json | grep -E '"name"|"version"|"files"|"exports"'
```

**확인 사항 / Checklist:**
- [ ] `dist/` 폴더 존재 / `dist/` folder exists
- [ ] `src/` 폴더 포함 (개발용) / `src/` folder included (for development)
- [ ] `exports` 필드 설정 확인 / `exports` field verified
- [ ] `peerDependencies` 설정 확인 (react, react-dom) / `peerDependencies` verified (react, react-dom)

#### 1.2 배포 실행

```bash
cd packages/hua-ux

# 배포 (공개 패키지, 첫 배포)
# --provenance 옵션: 빌드 출처 증명 (GitHub Actions 사용 시 권장)
npm publish --access public --provenance
```

**참고 / Note:**
- `--provenance` 옵션은 최근 npm에서 보안 강화를 위해 권장하는 옵션입니다
- GitHub Actions로 배포할 경우 특히 유용합니다
- 로컬에서 배포할 경우 생략 가능합니다

**예상 출력 / Expected Output:**
```
+ @hua-labs/hua-ux@0.1.0
```

#### 1.3 배포 확인 / 1.3 Verify Release

```bash
# npm 레지스트리에서 확인
npm view @hua-labs/hua-ux

# 설치 테스트
cd /tmp
mkdir test-hua-ux
cd test-hua-ux
pnpm init -y
pnpm add @hua-labs/hua-ux
```

**확인 사항 / Checklist:**
- [ ] npm 레지스트리에서 패키지 확인 가능 / Package visible on npm registry
- [ ] 설치 성공 / Installation successful
- [ ] 타입 정의 파일 포함 확인 / Type definition files included

---

### Step 2: create-hua-ux 배포

`@hua-labs/hua-ux` 배포 완료 후 진행합니다.

#### 2.1 배포 전 최종 확인

```bash
cd packages/create-hua-ux

# 빌드 확인
pnpm run build

# 배포할 파일 확인
npm pack --dry-run

# package.json 확인
cat package.json | grep -E '"name"|"version"|"files"|"bin"'
```

**확인 사항 / Checklist:**
- [ ] `dist/` 폴더 존재 / `dist/` folder exists
- [ ] `templates/` 폴더 포함 / `templates/` folder included
- [ ] `bin` 경로가 `dist/bin/create-hua-ux.js`로 올바름 / `bin` path is correct: `dist/bin/create-hua-ux.js`
- [ ] `getHuaUxVersion()` 함수가 `^0.1.0` 반환하는지 확인 / `getHuaUxVersion()` function returns `^0.1.0`

#### 2.2 배포 실행

```bash
cd packages/create-hua-ux

# 배포 (공개 패키지, 첫 배포)
# --provenance 옵션: 빌드 출처 증명 (GitHub Actions 사용 시 권장)
npm publish --access public --provenance
```

**참고 / Note:**
- `--provenance` 옵션은 최근 npm에서 보안 강화를 위해 권장하는 옵션입니다
- GitHub Actions로 배포할 경우 특히 유용합니다
- 로컬에서 배포할 경우 생략 가능합니다

**예상 출력 / Expected Output:**
```
+ create-hua-ux@0.1.0
```

#### 2.3 배포 확인 / 2.3 Verify Release

```bash
# npm 레지스트리에서 확인
npm view create-hua-ux

# CLI 설치 테스트
cd /tmp
rm -rf test-create-hua-ux
pnpm create hua-ux test-create-hua-ux
cd test-create-hua-ux
```

**확인 사항 / Checklist:**
- [ ] npm 레지스트리에서 패키지 확인 가능 / Package visible on npm registry
- [ ] `pnpm create hua-ux` 명령어 정상 작동 / `pnpm create hua-ux` command works
- [ ] 생성된 프로젝트의 `package.json`에 `@hua-labs/hua-ux: ^0.1.0` 포함 / Generated project's `package.json` includes `@hua-labs/hua-ux: ^0.1.0`
- [ ] 생성된 프로젝트에서 `pnpm install` 성공 / `pnpm install` succeeds in generated project
- [ ] 생성된 프로젝트에서 `pnpm dev` 성공 / `pnpm dev` succeeds in generated project

---

## 배포 후 확인 사항 / Post-Release Verification

### 1. npm 레지스트리 확인

```bash
# 패키지 정보 확인
npm view @hua-labs/hua-ux
npm view create-hua-ux

# 패키지 페이지 확인 (브라우저)
# https://www.npmjs.com/package/@hua-labs/hua-ux
# https://www.npmjs.com/package/create-hua-ux
```

**확인 사항 / Checklist:**
- [ ] 패키지 페이지에 README 표시됨 / README displayed on package page
- [ ] 버전 정보 정확함 / Version information is accurate
- [ ] 의존성 정보 정확함 / Dependency information is accurate
- [ ] 다운로드 통계 표시됨 / Download statistics displayed

### 2. 실제 사용 테스트

#### 2.1 hua-ux 직접 설치 테스트

```bash
cd /tmp
mkdir test-hua-ux-direct
cd test-hua-ux-direct
pnpm init -y
pnpm add @hua-labs/hua-ux zustand

# 간단한 테스트 파일 생성
cat > test.js << 'EOF'
const { Button } = require('@hua-labs/hua-ux');
console.log('@hua-labs/hua-ux 설치 성공 / @hua-labs/hua-ux installation successful');
EOF

node test.js
```

#### 2.2 create-hua-ux CLI 테스트

```bash
cd /tmp
rm -rf test-cli-project
pnpm create hua-ux test-cli-project
cd test-cli-project

# 의존성 확인
cat package.json | grep '@hua-labs/hua-ux'

# 설치 및 빌드 테스트
pnpm install
pnpm run build
```

**확인 사항 / Checklist:**
- [ ] `@hua-labs/hua-ux` 설치 성공 / `@hua-labs/hua-ux` installation successful
- [ ] `create-hua-ux` CLI 정상 작동 / `create-hua-ux` CLI works properly
- [ ] 생성된 프로젝트 빌드 성공 / Generated project builds successfully
- [ ] 생성된 프로젝트 실행 성공 / Generated project runs successfully

### 3. 문서 확인

**확인 사항 / Checklist:**
- [ ] npm 패키지 페이지에 README 표시됨 / README displayed on npm package page
- [ ] 사용 가이드 정확함 / Usage guide is accurate
- [ ] 예제 코드 작동함 / Example code works

---

## 문제 해결 / Troubleshooting

### 문제 1: npm 로그인 실패

**증상**: `npm login` 실패 또는 권한 오류

**해결**:
```bash
# npm 캐시 클리어
npm cache clean --force

# 다시 로그인
npm login

# 조직 권한 확인
npm org ls @hua-labs
```

### 문제 2: 패키지 이름 충돌 / Issue 2: Package Name Conflict

**증상 / Symptom:** `npm publish` 시 패키지 이름이 이미 존재한다는 오류 / Error that package name already exists when running `npm publish`

**해결 / Solution:**
- 패키지 이름이 고유한지 확인
- 스코프(`@hua-labs/`) 사용 확인
- npm 레지스트리에서 이름 확인

### 문제 3: 빌드 실패 / Issue 3: Build Failure

**증상 / Symptom:** `pnpm run build` 실패 / `pnpm run build` fails

**해결 / Solution:**
```bash
# 의존성 재설치
rm -rf node_modules
pnpm install

# TypeScript 캐시 클리어
rm -rf dist
pnpm run build
```

### 문제 4: 배포 후 설치 실패

**증상**: `pnpm add @hua-labs/hua-ux` 실패

**해결**:
- npm 레지스트리에서 패키지 확인
- 버전 정보 확인
- 네트워크 문제 확인
- npm 캐시 클리어 후 재시도

### 문제 5: create-hua-ux에서 hua-ux를 찾을 수 없음 / Issue 5: create-hua-ux Cannot Find hua-ux

**증상 / Symptom:** 생성된 프로젝트에서 `@hua-labs/hua-ux` 설치 실패 / `@hua-labs/hua-ux` installation fails in generated project

**해결 / Solution:**
- `@hua-labs/hua-ux`가 먼저 배포되었는지 확인
- `create-hua-ux/src/utils.ts`의 `getHuaUxVersion()` 함수가 올바른 버전 반환하는지 확인
- npm 레지스트리에서 패키지 확인

---

## 버전 관리 전략 / Version Management Strategy

### 현재 버전: 0.1.0 (Alpha) / Current Version: 0.1.0 (Alpha)

**버전 의미 / Version Meaning:**
- `0.x`: Alpha 단계, API 변경 가능 / Alpha stage, API changes allowed
- `1.x`: 안정화 후 / After stabilization

**참고: Alpha 태그 활용 / Note: Using Alpha Tag**
- 첫 배포인 만큼 예상치 못한 이슈가 있을 수 있으니, `latest` 태그 대신 `alpha` 태그로 먼저 배포하는 것도 방법입니다
- 현재는 `0.1.0`으로 `latest` 태그로 배포하지만, 필요시 `npm publish --tag alpha`로 배포 가능합니다
- 사용자는 `pnpm add @hua-labs/hua-ux@alpha`로 설치 가능합니다
- If needed, you can publish with `npm publish --tag alpha` instead of `latest`
- Users can install with `pnpm add @hua-labs/hua-ux@alpha`

### 버전 업데이트 방법 / Version Update Methods

#### 패치 버전 (0.1.0 → 0.1.1) / Patch Version (0.1.0 → 0.1.1)

```bash
cd packages/hua-ux
npm version patch
git push --tags

cd ../create-hua-ux
npm version patch
git push --tags
```

#### 마이너 버전 (0.1.0 → 0.2.0) / Minor Version (0.1.0 → 0.2.0)

```bash
cd packages/hua-ux
npm version minor
git push --tags

cd ../create-hua-ux
npm version minor
git push --tags
```

#### 메이저 버전 (0.1.0 → 1.0.0) / Major Version (0.1.0 → 1.0.0)

```bash
cd packages/hua-ux
npm version major
git push --tags

cd ../create-hua-ux
npm version major
git push --tags
```

### 버전 동기화 / Version Synchronization

**권장 사항 / Recommendation:**
- `@hua-labs/hua-ux`와 `create-hua-ux`의 버전을 동기화 / Synchronize versions of `@hua-labs/hua-ux` and `create-hua-ux`
- 또는 `create-hua-ux`에서 `@hua-labs/hua-ux`의 최신 버전을 자동으로 참조 / Or automatically reference the latest version of `@hua-labs/hua-ux` from `create-hua-ux`

**현재 구현 / Current Implementation:**
- `create-hua-ux/src/utils.ts`의 `getHuaUxVersion()` 함수가 자동으로 `hua-ux` 패키지의 `package.json`에서 버전을 읽어옴 / `getHuaUxVersion()` function in `create-hua-ux/src/utils.ts` automatically reads version from `hua-ux` package's `package.json`
- 모노레포 내부에서는 `workspace:*` 사용, 외부에서는 `^[version]` 형식 사용 / Uses `workspace:*` inside monorepo, `^[version]` format outside
- 빌드 시 자동으로 버전 동기화됨 (수동 업데이트 불필요) / Version automatically synchronized at build time (no manual update needed)

**자동화 원리 / Automation Principle:**
- `getHuaUxVersion()` 함수는 런타임에 `hua-ux` 패키지의 `package.json`을 읽어서 버전을 추출합니다
- 모노레포 내부에서는 `workspace:*`를 반환하고, 외부에서는 `^[version]` 형식으로 반환합니다
- `hua-ux` 패키지의 버전이 업데이트되면 자동으로 반영되므로 수동 업데이트가 필요 없습니다
- The `getHuaUxVersion()` function reads the `hua-ux` package's `package.json` at runtime to extract the version
- Returns `workspace:*` inside monorepo, `^[version]` format outside
- Automatically reflects version updates from `hua-ux` package, no manual update needed

---

## 관련 문서 / Related Documents

- [배포 체크리스트](./DEPLOYMENT_CHECKLIST_0.1.0.md)
- [npm 배포 가이드](../create-hua-ux/docs/NPM_PUBLISH_GUIDE.md)
- [hua-ux README](../../packages/hua-ux/README.md)
- [create-hua-ux README](../../packages/create-hua-ux/README.md)

---

## 배포 완료 후 / After Release

### 1. GitHub Release 생성 / 1. Create GitHub Release

```bash
# 태그 생성
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin v0.1.0

# GitHub에서 Release 생성
# https://github.com/HUA-Labs/HUA-Labs-public/releases/new
```

### 2. 문서 업데이트 / 2. Update Documentation

- [ ] README에 npm 설치 방법 명시 / Add npm installation instructions to README
- [ ] 사용 가이드 업데이트 / Update usage guide
- [ ] 예제 코드 검증 / Verify example code

### 3. 커뮤니티 공유 / 3. Community Sharing

- [ ] 개발로그 작성 / Write devlog
- [ ] 사용자 피드백 수집 준비 / Prepare for user feedback collection

---

**작성일 / Written**: 2025-12-29  
**작성자 / Author**: HUA Platform 개발팀 / HUA Platform Development Team  
**버전 / Version**: 0.1.0
