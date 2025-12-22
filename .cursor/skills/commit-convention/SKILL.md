---
name: Commit Convention
description: Guide for following HUA Platform's commit convention using English
license: MIT
compatibility:
  - cursor
---

# Commit Convention Skill

This skill guides you on following HUA Platform's Conventional Commits format using English.

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

## Rules

1. **First letter is lowercase**
2. **No period at the end**
3. **Use imperative mood** (add, fix, update, remove, etc.)
4. **Keep it concise (within 50 characters)**
5. **English only** (no Korean)

## Examples

### New Feature

```bash
git commit -m "feat(i18n): add Korean language support"
git commit -m "feat(ui): add new button component"
```

### Bug Fix

```bash
git commit -m "fix(api): resolve authentication token issue"
git commit -m "fix(db): fix database connection error"
```

### Documentation

```bash
git commit -m "docs: update API documentation"
git commit -m "docs(i18n): add usage examples"
```

### Refactoring

```bash
git commit -m "refactor(ui): simplify component structure"
git commit -m "refactor: reorganize folder structure"
```

### Configuration

```bash
git commit -m "chore(config): update TypeScript configuration"
git commit -m "chore(deps): update dependencies"
```

### Style

```bash
git commit -m "style: fix code formatting"
git commit -m "style(ui): update component styles"
```

## Body (Optional)

When a longer description is needed:

```bash
git commit -m "feat(api): add user authentication endpoint

- Add POST /api/auth/login endpoint
- Add JWT token generation
- Add password hashing with bcrypt"
```

## Footer (Optional)

Issue references or Breaking Changes:

```bash
git commit -m "feat(api): add new endpoint

BREAKING CHANGE: old endpoint is deprecated"
```

## Checklist

Before committing, check the following:

- [ ] Is the type correct? (feat, fix, docs, etc.)
- [ ] Is the scope appropriate? (optional)
- [ ] Is the description written in imperative mood?
- [ ] Is the first letter lowercase?
- [ ] Is there no period at the end?
- [ ] Is it within 50 characters?
- [ ] Is it written in English?
