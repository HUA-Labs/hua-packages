## 변경사항

- `pnpm-lock.yaml` 업데이트: `packages/create-hua-ux/package.json`과 동기화
- `apps/hua-website/app/favicon.ico` 추가
- `apps/hua-website/vercel.json` 생성: Vercel 배포 설정 추가

## 배포 준비

Vercel 배포를 위한 설정이 포함되어 있습니다:
- 모노레포 구조에 맞춘 빌드 명령어
- pnpm 10.24.0 명시 (corepack 사용)
- 관련 패키지 변경사항 감지 설정

## 관련 이슈

Vercel 배포 시 발생하던 `ERR_PNPM_OUTDATED_LOCKFILE` 오류 해결

## 참고사항

- GitHub Actions는 필요하지 않습니다 (Vercel이 자동으로 배포 처리)
- `vercel.json` 설정만으로 배포 가능
- `my-app` 앱의 설정을 참고하여 구성
