# 템플릿 문서

이 폴더는 프로젝트에서 사용하는 표준 템플릿들을 포함합니다.

---

## 템플릿 목록

### PR 템플릿
- [PR_TEMPLATE.md](./PR_TEMPLATE.md) - Pull Request 작성 템플릿

### Devlog 템플릿
- [DEVLOG_TEMPLATE.md](./DEVLOG_TEMPLATE.md) - 개발 로그 작성 템플릿

### 기타 템플릿
- [api-doc-template.md](./api-doc-template.md) - API 문서 작성 템플릿
- [pr-description-template.md](./pr-description-template.md) - PR 설명 템플릿 (간단 버전)
- [pr-merge-develop-to-main.md](./pr-merge-develop-to-main.md) - develop → main 병합 PR 템플릿

---

## 사용 방법

### PR 템플릿 사용
1. 새 PR을 생성할 때 `PR_TEMPLATE.md`의 내용을 복사
2. 각 섹션을 채워서 작성
3. 체크리스트 항목 확인

### Devlog 템플릿 사용
1. `docs/devlogs/` 폴더에 새 파일 생성
2. 파일명 형식: `DEVLOG_YYYY-MM-DD_제목.md`
3. `DEVLOG_TEMPLATE.md`의 내용을 복사하여 작성
4. `docs/devlogs/README.md`에 새 devlog 링크 추가

---

## 템플릿 작성 규칙

### 공통 규칙
- 이모지 사용 금지
- 명확하고 간결한 서식 사용
- 체크리스트는 실제로 확인 가능한 항목만 포함
- 날짜 형식: YYYY-MM-DD

### PR 템플릿 규칙
- 변경 사항을 명확히 설명
- Breaking Changes는 반드시 명시
- 테스트 결과 포함
- 관련 이슈 링크

### Devlog 템플릿 규칙
- 작업 내용을 구체적으로 기록
- 변경된 파일 목록 포함
- 테스트 결과 포함
- 다음 단계 명확히 작성

---

**최종 업데이트**: 2025-12-06

