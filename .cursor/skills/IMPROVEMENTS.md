# Cursor Rules & Skills 개선 사항

## 발견된 개선점

### 1. 스킬 간 상호 참조 부족
**문제**: 각 스킬이 독립적으로 작성되어 있어 관련 스킬 간 연결이 없음

**개선 방안**:
- 컴포넌트 생성 스킬에서 SDK 사용 스킬 참조 추가
- PR 생성 스킬에서 Git Flow 스킬 참조 추가
- 코드 리뷰 스킬에서 커밋 컨벤션 스킬 참조 추가

### 2. SDK 컴포넌트 목록 부정확
**문제**: `use-sdk/SKILL.md`에서 실제 사용 가능한 컴포넌트 목록이 제한적임

**현재**: Button, Card, Modal, Badge, Toast, Spinner, Icon만 언급
**실제**: 50개 이상의 컴포넌트가 있음 (Button, Action, Input, Link, Icon, Avatar, Modal, Container, Grid, Stack, Card, Panel, ActionToolbar, Navigation, Breadcrumb, Pagination, Table, Badge, Progress, Skeleton, Alert, Toast, LoadingSpinner, Tooltip, Popover, Dropdown, Drawer, BottomSheet, ConfirmModal, Form, Label, Checkbox, Radio, Select, Switch, Slider, Textarea, DatePicker, Upload, Autocomplete, Accordion, Tabs, Menu, ContextMenu, Command 등)

**개선 방안**:
- 실제 export 목록 참조하도록 업데이트
- 또는 `packages/hua-ui/src/index.ts` 파일 참조하도록 안내

### 3. 누락된 스킬들

#### 3.1 에러 처리 스킬
**필요성**: 프로젝트에 `apps/my-app/app/utils/errorHandler.ts` 같은 에러 처리 유틸리티가 있음

**추가할 내용**:
- 에러 처리 패턴
- API 에러 처리 방법
- 사용자 친화적 에러 메시지
- 에러 바운더리 사용

#### 3.2 테스트 작성 스킬
**필요성**: 프로젝트에서 Vitest를 사용하고 있음

**추가할 내용**:
- Vitest 테스트 작성 방법
- React 컴포넌트 테스트
- API 라우트 테스트
- 테스트 파일 위치 및 네이밍

#### 3.3 API 라우트 생성 스킬
**필요성**: Next.js App Router의 API 라우트 생성 가이드가 없음

**추가할 내용**:
- API 라우트 파일 구조
- 요청/응답 처리
- 에러 처리
- 타입 안전성

#### 3.4 타입 정의 스킬
**필요성**: TypeScript 타입 정의 가이드가 없음

**추가할 내용**:
- 타입 정의 위치
- 공유 타입 vs 로컬 타입
- 타입 가드 사용
- 유틸리티 타입 활용

#### 3.5 환경 변수 관리 스킬
**필요성**: 환경 변수 관리 가이드가 없음

**추가할 내용**:
- `.env` 파일 구조
- 환경별 설정
- 보안 고려사항
- Vercel 환경 변수 설정

### 4. .cursorrules 개선

#### 4.1 스킬 참조 명확화
**현재**: 스킬 목록만 나열
**개선**: 각 작업 유형별로 어떤 스킬을 참조해야 하는지 명시

#### 4.2 실제 프로젝트 구조 반영
**현재**: 일반적인 설명만 있음
**개선**: 실제 프로젝트의 특정 패턴이나 규칙 반영

### 5. 스킬 내용 개선

#### 5.1 예시 코드 개선
**문제**: 일부 스킬의 예시 코드가 실제 프로젝트 패턴과 다를 수 있음

**개선 방안**:
- 실제 프로젝트 코드에서 예시 가져오기
- 더 구체적인 예시 제공

#### 5.2 체크리스트 개선
**문제**: 일부 체크리스트가 너무 일반적임

**개선 방안**:
- 프로젝트 특화 체크리스트 추가
- 자동화 가능한 항목 명시

## 우선순위

### 높음 (즉시 개선)
1. ✅ SDK 컴포넌트 목록 업데이트
2. ✅ 스킬 간 상호 참조 추가
3. ✅ 에러 처리 스킬 추가
4. ✅ 테스트 작성 스킬 추가

### 중간 (단기 개선)
5. ✅ API 라우트 생성 스킬 추가
6. ✅ 타입 정의 스킬 추가
7. ✅ 데브로그 작성 스킬 추가
8. ✅ 디버깅 실패 로그 스킬 추가
9. ✅ 패턴 문서화 스킬 추가
10. ✅ .cursorrules 스킬 참조 명확화

### 낮음 (장기 개선)
8. 환경 변수 관리 스킬 추가
9. 예시 코드 실제 프로젝트 패턴 반영
10. 체크리스트 프로젝트 특화
