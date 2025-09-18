# HUA UI Site 🎨

**HUA Labs의 디자인 시스템을 체험하고 문서를 확인할 수 있는 공식 사이트입니다.**

## ✨ 주요 기능

### 🎯 **컴포넌트 갤러리**
- **모든 UI 컴포넌트**의 라이브 데모
- **다크모드** 지원
- **반응형 디자인**으로 모든 디바이스에서 완벽한 경험

### 📚 **문서화**
- **초보자 친화적** 가이드
- **실용적인 예제** 코드
- **베스트 프랙티스** 가이드

### 🎮 **플레이그라운드**
- **실시간 코드 편집**
- **컴포넌트 조합** 실험
- **코드 공유** 기능

## 🚀 시작하기

### 개발 서버 실행
```bash
pnpm dev
```

### 빌드
```bash
pnpm build
```

### 프로덕션 실행
```bash
pnpm start
```

## 🛠 기술 스택

- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **@hua-labs/ui** - 디자인 시스템
- **Lucide React** - 아이콘 시스템

## 📦 @hua-labs/ui 패키지

### 설치
```bash
npm install @hua-labs/ui
# 또는
pnpm add @hua-labs/ui
# 또는
yarn add @hua-labs/ui
```

### 기본 사용법
```tsx
import { Button, Card, Icon } from '@hua-labs/ui'

function App() {
  return (
    <Card>
      <Button>
        <Icon name="heart" size={20} className="mr-2" />
        좋아요
      </Button>
    </Card>
  )
}
```

### 사용 가능한 컴포넌트

#### 🎨 기본 컴포넌트
- **Button** - 다양한 변형과 크기를 지원하는 버튼
- **Card** - 콘텐츠 컨테이너 (CardHeader, CardContent, CardTitle, CardDescription)
- **Icon** - Lucide React 아이콘 관리 시스템

#### 🎛️ 레이아웃 컴포넌트
- **Container** - 콘텐츠 중앙 정렬 및 최대 너비 제한
- **Grid** - CSS Grid 기반 레이아웃
- **Stack** - Flexbox 기반 수직/수평 스택

#### 🌙 테마 컴포넌트
- **ThemeToggle** - 다크모드 전환
- **LanguageToggle** - 다국어 전환

### 아이콘 시스템

#### 카테고리별 아이콘
```tsx
import { iconCategories } from '@hua-labs/ui'

// 사용 가능한 카테고리
console.log(Object.keys(iconCategories))
// ['navigation', 'actions', 'communication', 'files', 'media', 'social', 'weather', 'objects']
```

#### 아이콘 사용법
```tsx
import { Icon } from '@hua-labs/ui'

// 기본 사용
<Icon name="heart" size={24} />

// 스타일링
<Icon name="star" size={20} className="text-yellow-500" />

// 버튼과 함께
<Button>
  <Icon name="download" size={20} className="mr-2" />
  다운로드
</Button>
```

## 🎨 디자인 철학

### 리듬이의 디자인 원칙
- **4의 배수 스페이싱**: 4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px...
- **8의 배수 스페이싱**: 8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px...
- **넉넉한 여백**: py (상하 여백)을 넉넉하게 주어 안정감과 여유로움
- **보더 대신 섀도우**: 더 현대적이고 깊이감 있는 디자인
- **안정적이고 예쁜**: 사용자가 편안하게 느낄 수 있는 디자인

### 색상 시스템
- **라이트/다크 모드** 자동 전환
- **일관된 색상 팔레트**
- **접근성 고려** 디자인

## 🌍 다국어 지원

- **한국어 (ko)** - 기본 언어
- **영어 (en)** - 국제 사용자
- **일본어 (ja)** - 일본 사용자
- **중국어 (zh)** - 중국 사용자

언어 전환은 우측 상단의 언어 토글 버튼을 사용하세요.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx      # 메인 레이아웃
│   ├── page.tsx        # 홈페이지
│   ├── globals.css     # 글로벌 스타일
│   ├── icons/          # 아이콘 페이지
│   └── playground/     # 플레이그라운드
├── components/         # 공통 컴포넌트
└── lib/               # 유틸리티 함수
```

## 🔧 개발 가이드

### 새로운 컴포넌트 추가
1. `packages/hua-ui/src/components/`에 컴포넌트 파일 생성
2. `packages/hua-ui/src/index.ts`에 export 추가
3. UI 사이트에서 데모 추가

### 스타일 가이드
- Tailwind CSS 클래스 사용
- 4/8 배수 스페이싱 준수
- 다크모드 지원
- 반응형 디자인 적용

## 🤝 기여하기

1. **Fork** 프로젝트
2. **Feature branch** 생성 (`git checkout -b feature/amazing-feature`)
3. **Commit** 변경사항 (`git commit -m 'Add amazing feature'`)
4. **Push** 브랜치 (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔗 관련 링크

- [@hua-labs/ui Package](../../packages/hua-ui/)
- [HUA Animation Site](../hua-animation-site/)
- [HUA Labs Official](../hua-labs-official/)

---

**HUA Labs**에서 제작되었습니다. 🚀 