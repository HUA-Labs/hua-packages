---
name: Commit Convention
description: Guide for following HUA Platform's commit convention using English
license: MIT
compatibility:
  - cursor
---

# Commit Convention Skill

This skill guides you on following HUA Platform's Conventional Commits format using English.

## 🚨 AI 어시스턴트 필수 준수 사항

### 커밋 메시지 작성 시 자동 체크

```
IF (커밋 메시지를 작성할 때) THEN
  1. 타입 확인 (feat, fix, docs, etc.)
  2. 스코프 확인 (optional, but recommended)
  3. 첫 글자 소문자 확인
  4. 마침표 없음 확인
  5. 50자 이내 확인
  6. 영어만 사용 확인
  7. 명령형 사용 확인
END IF
```

### 자동 검증 및 제안

```
IF (커밋 메시지가 규칙을 위반) THEN
  → 사용자에게 올바른 형식 제안
  → 예시 제공
END IF
```

## Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.) that do not affect functionality
- **refactor**: Code refactoring without feature changes or bug fixes
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

## Scope

- **i18n**: Internationalization related
- **api**: API related
- **ui**: User interface related
- **auth**: Authentication related
- **db**: Database related
- **config**: Configuration related
- **build**: Build related
- **deps**: Dependencies related

## Rules (⚠️ 필수 준수)

1. **First letter is lowercase** - 첫 글자는 반드시 소문자
2. **No period at the end** - 마지막에 마침표 없음
3. **Use imperative mood** - 명령형 사용 (add, fix, update, remove, etc.)
4. **Keep it concise (within 50 characters)** - 50자 이내
5. **English only** - 영어만 사용 (한국어 금지)

## Examples

### ✅ 올바른 예시

#### New Feature
```bash
feat(i18n): add Korean language support
feat(ui): add new button component
feat(api): add user authentication endpoint
```

#### Bug Fix
```bash
fix(api): resolve authentication token issue
fix(db): fix database connection error
fix(ui): fix button click handler
```

#### Documentation
```bash
docs: update API documentation
docs(i18n): add usage examples
docs: add setup guide
```

#### Refactoring
```bash
refactor(ui): simplify component structure
refactor: reorganize folder structure
refactor(api): improve error handling
```

#### Configuration
```bash
chore(config): update TypeScript configuration
chore(deps): update dependencies
chore(build): update build scripts
```

#### Style
```bash
style: fix code formatting
style(ui): update component styles
style: apply prettier formatting
```

### ❌ 잘못된 예시

```bash
# 첫 글자 대문자 (잘못됨)
Feat(i18n): Add Korean language support

# 마침표 있음 (잘못됨)
feat(i18n): add Korean language support.

# 한국어 사용 (잘못됨)
feat(i18n): 한국어 지원 추가

# 과거형 사용 (잘못됨)
feat(i18n): added Korean language support

# 너무 김 (잘못됨)
feat(i18n): add comprehensive Korean language support with all necessary translations and locale files
```

## Body (Optional)

When a longer description is needed:

```bash
feat(api): add user authentication endpoint

- Add POST /api/auth/login endpoint
- Add JWT token generation
- Add password hashing with bcrypt
```

## Footer (Optional)

Issue references or Breaking Changes:

```bash
feat(api): add new endpoint

BREAKING CHANGE: old endpoint is deprecated
```

또는

```bash
fix(ui): resolve button click issue

Closes #123
```

## AI 어시스턴트 실행 체크리스트

커밋 메시지를 작성할 때 다음을 자동으로 확인하세요:

### 타입 확인
- [ ] 타입이 올바른가? (feat, fix, docs, style, refactor, test, chore)
- [ ] 타입이 작업 내용과 일치하는가?

### 스코프 확인
- [ ] 스코프가 적절한가? (i18n, api, ui, auth, db, config, build, deps)
- [ ] 스코프가 선택사항이지만 권장됨

### 형식 확인
- [ ] 첫 글자가 소문자인가?
- [ ] 마지막에 마침표가 없는가?
- [ ] 50자 이내인가?
- [ ] 영어로 작성되었는가? (한국어 금지)

### 문법 확인
- [ ] 명령형을 사용했는가? (add, fix, update, remove 등)
- [ ] 과거형이나 현재진행형을 사용하지 않았는가?

### 자동 검증 로직

```
IF (커밋 메시지 작성 시) THEN
  IF (첫 글자가 대문자) THEN
    → "첫 글자는 소문자로 시작해야 합니다. 예: 'feat' not 'Feat'"
  END IF
  
  IF (마지막에 마침표 있음) THEN
    → "마지막 마침표를 제거하세요."
  END IF
  
  IF (한국어 사용) THEN
    → "커밋 메시지는 영어로만 작성해야 합니다."
  END IF
  
  IF (50자 초과) THEN
    → "커밋 메시지는 50자 이내로 작성하세요. 긴 설명은 body에 작성하세요."
  END IF
  
  IF (과거형 사용) THEN
    → "명령형을 사용하세요. 예: 'add' not 'added', 'fix' not 'fixed'"
  END IF
END IF
```

## 참고

- [Conventional Commits](https://www.conventionalcommits.org/)
- 프로젝트 규칙: 영어만 사용, 첫 글자 소문자, 마침표 없음, 50자 이내
