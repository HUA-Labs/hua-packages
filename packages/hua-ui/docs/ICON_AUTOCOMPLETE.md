# Icon 자동완성 및 스니펫 가이드

## 개요

아이콘 이름 자동완성과 VS Code 스니펫을 통해 개발 생산성을 향상시킵니다.

## 설치

### VS Code 스니펫

스니펫 파일은 자동으로 생성됩니다:

```bash
pnpm generate:icon-snippets
```

생성된 파일: `.vscode/hua-ui-icons.code-snippets`

### 수동 설치 (선택사항)

1. VS Code에서 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. "Preferences: Configure User Snippets" 선택
3. "New Global Snippets file..." 선택
4. 파일 이름: `hua-ui-icons`
5. 생성된 스니펫 파일 내용 복사

## 사용법

### 스니펫 Prefix 규칙

모든 스니펫은 일관된 네이밍 규칙을 따릅니다:

**규칙:** `huaicon` + `suffix`

| Suffix | 설명 | 예시 |
|--------|------|------|
| (없음) | 기본 Icon 컴포넌트 | `huaicon` |
| `size` | 크기 지정 Icon | `huaiconsize` |
| `prov` | 프로바이더 지정 Icon | `huaiconprov` |
| `anime` | 애니메이션 Icon | `huaiconanime` |
| `status` | 상태 Icon | `huaiconstatus` |
| `emotion` | 감정 Icon | `huaiconemotion` |
| `provider` | IconProvider 설정 | `huaiconprovider` |

이 규칙을 이해하면 새로운 스니펫을 쉽게 예측할 수 있습니다.

### 1. 기본 스니펫

**`huaicon`** - 기본 Icon 컴포넌트

```tsx
// huaicon 입력 후 Tab
<Icon name="home" />
```

**자동완성:**
- 아이콘 이름 드롭다운에서 선택
- 프로바이더별 이름 자동 매핑

### 2. 크기 지정 스니펫

**`huaiconsize`** - 크기 지정 Icon

```tsx
// huaiconsize 입력 후 Tab
<Icon name="home" size={20} className="" />
```

### 3. 프로바이더 지정 스니펫

**`huaiconprov`** - 프로바이더 지정 Icon

```tsx
// huaiconprov 입력 후 Tab
<Icon name="home" provider="phosphor" />
```

### 4. 애니메이션 스니펫

**`huaiconanime`** - 애니메이션 Icon

```tsx
// huaiconanime 입력 후 Tab
<Icon name="loader" spin />
```

### 5. 상태 아이콘 스니펫

**`huaiconstatus`** - 상태 Icon

```tsx
// huaiconstatus 입력 후 Tab
<Icon status="loading" spin />
```

### 6. 감정 아이콘 스니펫

**`huaiconemotion`** - 감정 Icon

```tsx
// huaiconemotion 입력 후 Tab
<Icon emotion="happy" size={20} />
```

### 7. IconProvider 설정 스니펫

**`huaiconprovider`** - IconProvider 설정

```tsx
// huaiconprovider 입력 후 Tab
<IconProvider
  set="phosphor"
  weight="regular"
  size={20}
  color="currentColor"
>
  {/* Your app content */}
</IconProvider>
```

## 프로바이더별 아이콘 이름 확인

### TypeScript 자동완성

```tsx
import { iconProviderMapping, getIconNameForProvider } from '@hua-labs/ui'

// 프로바이더별 이름 확인
const lucideName = getIconNameForProvider('home', 'lucide')  // 'Home'
const phosphorName = getIconNameForProvider('home', 'phosphor')  // 'House'
const untitledName = getIconNameForProvider('home', 'untitled')  // 'home'

// 전체 매핑 확인
console.log(iconProviderMapping.home)
// { lucide: 'Home', phosphor: 'House', untitled: 'home' }
```

### 아이콘 이름 유효성 검사

```tsx
import { isValidIconName } from '@hua-labs/ui'

if (isValidIconName('home')) {
  // 유효한 아이콘 이름
}
```

## 프로바이더별 아이콘 이름 매핑

### 예시: `home` 아이콘

| 프로바이더 | 아이콘 이름 |
|-----------|------------|
| Lucide | `Home` |
| Phosphor | `House` |
| Untitled | `home` |

**사용법:**
```tsx
// PROJECT_ICONS에 매핑된 경우 - 자동 변환
<Icon name="home" provider="lucide" />   // Lucide: Home
<Icon name="home" provider="phosphor" /> // Phosphor: House
<Icon name="home" provider="untitled" />  // Untitled: home

// 매핑되지 않은 경우 - 직접 이름 사용
<Icon name="someNewIcon" />  // 동적 로딩
```

## 실전 예시

### 1. 네비게이션 아이콘

```tsx
// huaicon 입력
<Icon name="arrowLeft" className="h-4 w-4" />
<Icon name="home" size={20} />
<Icon name="settings" variant="primary" />
```

### 2. 버튼 아이콘

```tsx
// huaiconsize 입력
<Button>
  <Icon name="download" size={16} className="mr-2" />
  다운로드
</Button>
```

### 3. 상태 표시

```tsx
// huaiconstatus 입력
<Icon status="loading" spin />
<Icon status="success" variant="success" />
<Icon status="error" variant="error" />
```

### 4. 프로바이더 변경

```tsx
// huaiconprov 입력
<Icon name="home" provider="phosphor" weight="bold" />
<Icon name="settings" provider="lucide" />
```

## 스니펫 구조

### 스니펫 JSON 예시

스니펫은 JSON 형태로 정의됩니다:

```json
{
  "Icon Component - Basic": {
    "prefix": "huaicon",
    "body": [
      "<Icon name=\"${1|home,arrowLeft,arrowRight|}\" ${2|size,className,variant|}${3:={$4}} />"
    ],
    "description": "HUA UI - Icon component"
  },
  "Icon Component - With Size": {
    "prefix": "huaiconsize",
    "body": [
      "<Icon name=\"${1|home,arrowLeft|}\" size={${2:20}} className=\"${3}\" />"
    ],
    "description": "HUA UI - Icon with size"
  },
  "IconProvider - Setup": {
    "prefix": "huaiconprovider",
    "body": [
      "<IconProvider",
      "  set=\"${1|phosphor,lucide,untitled|}\"",
      "  weight=\"${2|thin,light,regular,bold,duotone,fill|}\"",
      "  size={${3:20}}",
      "  color=\"${4:currentColor}\"",
      ">",
      "  ${5:// Your app content}",
      "</IconProvider>"
    ],
    "description": "HUA UI - IconProvider setup"
  }
}
```

**스니펫 필드 설명:**
- `prefix`: 스니펫을 트리거하는 키워드
- `body`: 스니펫이 생성할 코드 (배열로 여러 줄 지원)
- `description`: 스니펫 설명 (자동완성에 표시)

**스니펫 변수:**
- `${1}`, `${2}`: 탭 순서 (Tab으로 이동)
- `${1:default}`: 기본값이 있는 변수
- `${1|option1,option2|}`: 선택 가능한 옵션

## 스니펫 커스터마이징

### 스니펫 파일 위치

```
packages/hua-ui/.vscode/hua-ui-icons.code-snippets
```

### 스니펫 재생성

아이콘 추가/변경 후 스니펫 재생성:

```bash
pnpm generate:icon-snippets
```

### 커스텀 스니펫 추가

`.vscode/hua-ui-icons.code-snippets` 파일을 직접 수정하여 커스텀 스니펫을 추가할 수 있습니다.

## 타입 기반 자동완성 흐름

### 자동완성 구조

```
icons.ts / PROJECT_ICONS
    ↓
IconName 타입 생성
    ↓
IconProps.name: IconName
    ↓
TypeScript 자동완성
    ↓
VS Code IntelliSense
```

**동작 방식:**
1. `icons.ts`와 `PROJECT_ICONS`에서 아이콘 이름 추출
2. `IconName` 타입으로 정의
3. `IconProps.name`에 `IconName` 타입 적용
4. TypeScript가 자동완성 제공
5. VS Code IntelliSense에서 드롭다운 표시

## Icon Alias 시스템

### Alias란?

여러 이름이 같은 아이콘을 가리키도록 하는 시스템입니다.

**예시:**
```tsx
// 모두 같은 아이콘 (arrowLeft)
<Icon name="back" />
<Icon name="prev" />
<Icon name="previous" />
<Icon name="arrowLeft" />
```

### 지원하는 Alias

**Navigation:**
- `back`, `prev`, `previous` → `arrowLeft`
- `forward`, `next` → `arrowRight`

**Actions:**
- `plus`, `new` → `add`
- `remove`, `trash` → `delete`
- `pencil`, `modify` → `edit`
- `close`, `cancel` → `x`

**Status:**
- `spinner`, `loading`, `wait` → `loader`
- `checkmark`, `checkCircle` → `success`
- `fail`, `cross`, `xCircle` → `error`
- `alert`, `caution` → `warning`

**User:**
- `person`, `account`, `profile` → `user`
- `people`, `group`, `team` → `users`

**Settings:**
- `gear`, `config`, `preferences`, `options` → `settings`

**기타:**
- `email`, `envelope` → `mail`
- `chat`, `comment`, `talk` → `message`
- `photo`, `picture`, `img` → `image`
- `document`, `doc`, `text` → `fileText`
- `directory`, `dir` → `folder`
- `date`, `schedule` → `calendar`
- `time`, `watch` → `clock`
- `graph`, `stats`, `analytics` → `barChart`
- `lightning`, `bolt`, `flash` → `zap`
- `ai`, `intelligence`, `think` → `brain`
- `idea`, `bulb`, `inspiration` → `lightbulb`

### Alias 사용 예시

```tsx
// 직관적인 이름 사용 가능
<Icon name="back" />        // arrowLeft
<Icon name="prev" />        // arrowLeft
<Icon name="next" />        // arrowRight
<Icon name="close" />       // x
<Icon name="spinner" />     // loader
<Icon name="email" />       // mail
<Icon name="chat" />        // message
```

### Alias 확인

```tsx
import { resolveIconAlias, getIconAliases } from '@hua-labs/ui'

// Alias 해결 (역방향 매핑)
const actualName1 = resolveIconAlias('back')         // 'arrowLeft'
const actualName2 = resolveIconAlias('prev')        // 'arrowLeft'
const actualName3 = resolveIconAlias('previous')    // 'arrowLeft'
const actualName4 = resolveIconAlias('gear')        // 'settings'
const actualName5 = resolveIconAlias('preferences') // 'settings'
const actualName6 = resolveIconAlias('spinner')     // 'loader'
const actualName7 = resolveIconAlias('email')       // 'mail'
const actualName8 = resolveIconAlias('chat')        // 'message'

// 특정 아이콘의 모든 alias 가져오기
const aliases1 = getIconAliases('arrowLeft')
// ['back', 'prev', 'previous']

const aliases2 = getIconAliases('settings')
// ['gear', 'config', 'preferences', 'prefs']

const aliases3 = getIconAliases('loader')
// ['spinner', 'loading', 'wait']
```

**역방향 매핑 예시:**
- `gear`, `config`, `preferences` → 모두 `settings`로 매핑
- `back`, `prev`, `previous` → 모두 `arrowLeft`로 매핑
- `spinner`, `loading`, `wait` → 모두 `loader`로 매핑

## 팁

### 1. 자동완성 활용

- `name="` 입력 시 자동완성 드롭다운 표시
- 프로바이더별 이름 자동 매핑
- Alias 이름도 자동완성에 포함

### 2. 스니펫 단축키

- `huaicon` - 기본 Icon
- `huaiconsize` - 크기 지정
- `huaiconprov` - 프로바이더 지정
- `huaiconanime` - 애니메이션
- `huaiconstatus` - 상태
- `huaiconemotion` - 감정
- `huaiconprovider` - Provider 설정

### 3. 프로바이더 이름 확인

```tsx
import { iconProviderMapping } from '@hua-labs/ui'

// 특정 아이콘의 프로바이더별 이름 확인
console.log(iconProviderMapping.home)
// { lucide: 'Home', phosphor: 'House', untitled: 'home' }
```

## 관련 문서

- [Icon System Documentation](./ICON_SYSTEM.md)
- [Icon Usage Guide](./ICON_USAGE_GUIDE.md)
- [Icon Optimization Plan](./ICON_OPTIMIZATION_PLAN.md)

