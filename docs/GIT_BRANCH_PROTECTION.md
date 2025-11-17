# 브랜치 보호 규칙 설정 가이드

이 문서는 GitHub에서 `main`과 `develop` 브랜치를 보호하기 위한 설정 가이드입니다.

## 🛡️ 브랜치 보호 규칙 설정

### 1. GitHub 저장소 설정 접근

1. GitHub 저장소로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Branches** 클릭
4. **Add branch protection rule** 또는 기존 규칙 편집

### 2. `main` 브랜치 보호 규칙

#### 기본 설정
- **Branch name pattern**: `main`
- **Protect matching branches**: 체크

#### 필수 설정 항목

1. **Require a pull request before merging**
   - ✅ Require approvals: `1` (최소 1명의 승인 필요)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners (코드 소유자 리뷰 필요)

2. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - **Status checks that are required**:
     - `type-check` (타입 체크)
     - `lint` (린트)
     - `build` (빌드)

3. **Require conversation resolution before merging**
   - ✅ 체크 (PR의 모든 대화가 해결되어야 함)

4. **Do not allow bypassing the above settings**
   - ✅ 체크 (관리자도 규칙 우회 불가)

5. **Restrict who can push to matching branches**
   - ✅ 체크 (직접 푸시 방지)
   - 아무도 직접 푸시할 수 없도록 설정

### 3. `develop` 브랜치 보호 규칙

#### 기본 설정
- **Branch name pattern**: `develop`
- **Protect matching branches**: 체크

#### 필수 설정 항목

1. **Require a pull request before merging**
   - ✅ Require approvals: `1` (최소 1명의 승인 필요)
   - ✅ Dismiss stale pull request approvals when new commits are pushed

2. **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - **Status checks that are required**:
     - `type-check` (타입 체크)
     - `lint` (린트)
     - `build` (빌드)

3. **Require conversation resolution before merging**
   - ✅ 체크 (PR의 모든 대화가 해결되어야 함)

4. **Do not allow bypassing the above settings**
   - ⚠️ 선택사항 (개발 브랜치이므로 유연하게 설정 가능)

5. **Restrict who can push to matching branches**
   - ✅ 체크 (직접 푸시 방지)

## 📋 CODEOWNERS 파일 (선택사항)

코드 소유자를 지정하여 특정 파일/디렉토리 변경 시 자동으로 리뷰어를 지정할 수 있습니다.

`.github/CODEOWNERS` 파일 생성:

```
# 전체 저장소 기본 소유자
* @your-username

# 특정 앱/패키지 소유자
/apps/my-app/ @my-app-team
/apps/my-api/ @api-team
/packages/hua-ui/ @ui-team
```

## 🔧 설정 확인

설정 후 다음을 확인하세요:

1. ✅ `main` 브랜치에 직접 푸시 시도 → 거부되어야 함
2. ✅ PR 생성 시 자동으로 체크리스트 표시
3. ✅ PR 머지 전 CI 체크 통과 필요
4. ✅ 승인 없이 머지 불가

## 📝 참고사항

- **관리자 권한**: 관리자도 규칙을 우회할 수 없도록 설정하는 것을 권장합니다
- **예외 상황**: 긴급한 경우를 위해 별도의 `hotfix` 브랜치 전략을 사용할 수 있습니다
- **리뷰어 지정**: CODEOWNERS 파일을 사용하면 자동으로 리뷰어가 지정됩니다

## 🚨 문제 해결

### "Status checks are required" 오류
- GitHub Actions가 실행 중인지 확인
- 워크플로우 파일이 올바른지 확인
- Status check 이름이 브랜치 보호 규칙과 일치하는지 확인

### "Review required" 오류
- 최소 1명의 승인이 필요합니다
- CODEOWNERS 파일이 있다면 해당 사용자의 승인이 필요할 수 있습니다

