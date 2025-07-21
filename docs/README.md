# 📚 HUA Platform Documentation

이 폴더는 HUA Platform의 모든 문서를 관리합니다.

## 📁 폴더 구조

### 📖 `public/` - 공개 문서 (Git에 포함)
- **`api/`** - API 문서 및 스펙
- **`guides/`** - 개발 가이드 및 튜토리얼
- **`architecture/`** - 시스템 아키텍처 문서
- **`user-manuals/`** - 사용자 매뉴얼

### 🔒 `private/` - 비공개 문서 (Git에서 제외)
- **`meetings/`** - 회의록 및 논의사항
- **`internal/`** - 내부 문서 및 노트
- **`security/`** - 보안 관련 문서

### 📋 `templates/` - 문서 템플릿
- 문서 작성 시 사용할 템플릿들

## 📝 문서 작성 가이드

### 공개 문서 작성 시
1. `docs/public/` 하위의 적절한 폴더에 작성
2. 마크다운(.md) 형식 사용
3. 한글과 영어 병기 권장
4. 이미지는 `docs/public/assets/` 폴더에 저장

### 비공개 문서 작성 시
1. `docs/private/` 하위의 적절한 폴더에 작성
2. `.gitignore`에 의해 Git에서 자동 제외됨
3. 민감한 정보는 절대 공개 폴더에 저장하지 않음

## 🔍 문서 검색

- **API 문서**: `docs/public/api/`
- **개발 가이드**: `docs/public/guides/`
- **아키텍처**: `docs/public/architecture/`
- **사용자 매뉴얼**: `docs/public/user-manuals/`

## 📋 문서 템플릿

문서 작성 시 `docs/templates/` 폴더의 템플릿을 참고하세요.

---

**⚠️ 주의사항**: `docs/private/` 폴더의 내용은 Git에 포함되지 않습니다. 중요한 정보는 별도로 백업하세요. 