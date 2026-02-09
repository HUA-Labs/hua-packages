#!/bin/bash
set -e

echo "🧪 CLI 테스트 시작..."

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 빌드 확인
echo -e "${YELLOW}📦 Step 1: 빌드 확인...${NC}"
cd "$(dirname "$0")/.."
if ! pnpm run build; then
  echo -e "${RED}❌ 빌드 실패${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 빌드 성공${NC}"

# 2. 임시 디렉토리에서 테스트
TEST_DIR=$(mktemp -d)
echo -e "${YELLOW}📁 테스트 디렉토리: ${TEST_DIR}${NC}"
cd "$TEST_DIR"

# 3. CLI 실행
echo -e "${YELLOW}🚀 Step 2: CLI 실행...${NC}"
PROJECT_NAME="test-cli-$(date +%s)"
NON_INTERACTIVE=1 node "$(dirname "$0")/../dist/bin/create-hua.js" "$PROJECT_NAME" --no-install

if [ ! -d "$PROJECT_NAME" ]; then
  echo -e "${RED}❌ 프로젝트 생성 실패${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 프로젝트 생성 성공${NC}"

# 4. 파일 존재 확인
echo -e "${YELLOW}📋 Step 3: 파일 검증...${NC}"
cd "$PROJECT_NAME"

REQUIRED_FILES=(
  "package.json"
  "hua.config.ts"
  "tailwind.config.js"
  "tsconfig.json"
  "app/layout.tsx"
  "app/page.tsx"
  "translations/ko/common.json"
  "translations/en/common.json"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ 필수 파일 누락: $file${NC}"
    exit 1
  fi
done
echo -e "${GREEN}✅ 모든 필수 파일 존재 확인${NC}"

# 5. package.json 검증
echo -e "${YELLOW}📦 Step 4: package.json 검증...${NC}"
if ! grep -q '"@hua-labs/hua"' package.json; then
  echo -e "${RED}❌ @hua-labs/hua 의존성 누락${NC}"
  exit 1
fi
if ! grep -q '"next"' package.json; then
  echo -e "${RED}❌ next 의존성 누락${NC}"
  exit 1
fi
echo -e "${GREEN}✅ package.json 검증 성공${NC}"

# 6. 의존성 설치 및 빌드 테스트
echo -e "${YELLOW}🔨 Step 5: 의존성 설치 및 빌드 테스트...${NC}"
if ! pnpm install --frozen-lockfile; then
  echo -e "${RED}❌ 의존성 설치 실패${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 의존성 설치 성공${NC}"

# 빌드는 시간이 오래 걸릴 수 있으므로 선택적
# if ! pnpm build; then
#   echo -e "${RED}❌ 빌드 실패${NC}"
#   exit 1
# fi
# echo -e "${GREEN}✅ 빌드 성공${NC}"

# 7. 정리
echo -e "${YELLOW}🧹 정리 중...${NC}"
cd /
rm -rf "$TEST_DIR"

echo -e "${GREEN}✅ CLI 테스트 성공!${NC}"
