# Swagger/OpenAPI 문서화 설정 가이드

## 개요

HUA API 프로젝트에 Swagger/OpenAPI 문서화를 도입했습니다. 이를 통해 API를 자동으로 문서화하고, 인터랙티브한 테스트 UI를 제공합니다.

## 설치

```bash
cd apps/my-api
pnpm install
```

설치할 패키지:
- `swagger-jsdoc`: JSDoc 주석에서 OpenAPI 스펙 생성
- `swagger-ui-react`: Swagger UI React 컴포넌트

## 사용 방법

### 1. API 문서 확인

개발 서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

```
http://localhost:3000/api-docs
```

### 2. API에 Swagger 주석 추가

각 API 라우트 파일에 JSDoc 형식의 Swagger 주석을 추가합니다:

```typescript
/**
 * @swagger
 * /api/lite:
 *   post:
 *     summary: API 설명
 *     description: 상세 설명
 *     tags: [Lite]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: 성공
 */
export async function POST(request: NextRequest) {
  // ...
}
```

### 3. 주요 설정 파일

- **Swagger 설정**: `apps/my-api/lib/swagger/config.ts`
- **API 문서 페이지**: `apps/my-api/app/api-docs/page.tsx`
- **Swagger JSON 엔드포인트**: `apps/my-api/app/api/swagger.json/route.ts`

## Swagger 주석 작성 가이드

### 기본 구조

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   [method]:
 *     summary: 짧은 설명
 *     description: 상세 설명
 *     tags: [태그명]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: paramName
 *         in: query
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 성공
 */
```

### 인증 설정

```typescript
security:
  - bearerAuth: []
```

### 요청 본문 (Request Body)

```typescript
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - field1
        properties:
          field1:
            type: string
            description: 필드 설명
          field2:
            type: number
            default: 0
```

### 응답 (Response)

```typescript
responses:
  200:
    description: 성공
    content:
      application/json:
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              type: object
  400:
    description: 잘못된 요청
```

## 태그 관리

`lib/swagger/config.ts`에서 태그를 관리합니다:

```typescript
tags: [
  {
    name: 'Auth',
    description: '인증 관련 API',
  },
  {
    name: 'User',
    description: '사용자 관련 API',
  },
  // ...
]
```

## 환경 변수

`.env.local`에 다음 변수를 설정할 수 있습니다:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 프로덕션 배포

프로덕션 환경에서는 `/api-docs` 경로에 접근 제한을 두는 것을 권장합니다.

## 참고 자료

- [OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc 문서](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI React](https://github.com/swagger-api/swagger-ui)

## 다음 단계

1. 모든 주요 API에 Swagger 주석 추가
2. 타입 정의를 스키마로 자동 변환하는 유틸리티 추가
3. API 버전 관리 추가
4. 클라이언트 SDK 자동 생성 설정

