# 🚀 HUA Motion SDK 배포 가이드

## 📦 npm 배포 준비

### 1. 빌드 확인
```bash
npm run build
```

### 2. 배포 전 체크리스트
- [ ] `package.json`의 버전이 올바른지 확인
- [ ] `README.md`가 최신 상태인지 확인
- [ ] `LICENSE` 파일이 있는지 확인
- [ ] `dist/` 폴더에 빌드된 파일들이 있는지 확인
- [ ] `.npmignore` 파일이 올바르게 설정되었는지 확인

### 3. npm 로그인
```bash
npm login
```

### 4. 배포 실행
```bash
npm publish
```

### 5. 스코프 패키지 배포 (선택사항)
만약 `@hua-labs` 스코프를 사용한다면:
```bash
npm publish --access public
```

## 🔧 배포 후 확인

### 1. npm 레지스트리에서 확인
- https://www.npmjs.com/package/@hua-labs/motion

### 2. 설치 테스트
```bash
npm install @hua-labs/motion
```

### 3. 사용 테스트
```tsx
import { useSimplePageMotion } from '@hua-labs/motion'

function TestComponent() {
  const { ref, isVisible, style } = useSimplePageMotion('fade-in')
  
  return (
    <div ref={ref} style={style}>
      테스트 요소
    </div>
  )
}
```

## 📝 버전 관리

### 시맨틱 버저닝
- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 이전 버전과 호환되는 기능 추가
- **PATCH**: 이전 버전과 호환되는 버그 수정

### 버전 업데이트
```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

## 🐛 문제 해결

### 빌드 오류
```bash
npm run clean
npm run build
```

### 배포 오류
```bash
npm whoami  # 로그인 상태 확인
npm login   # 다시 로그인
```

### 패키지 이름 충돌
- npm 레지스트리에서 사용 가능한 이름인지 확인
- 스코프 사용 고려 (`@hua-labs/motion`)

## 📚 추가 리소스

- [npm 배포 가이드](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [시맨틱 버저닝](https://semver.org/)
- [TypeScript 배포 가이드](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) 