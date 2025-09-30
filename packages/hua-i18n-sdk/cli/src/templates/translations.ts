import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createTranslationFiles(cwd: string): Promise<void> {
  console.log(chalk.blue('\n📝 Creating translation files...'));

  // 한국어 번역 파일
  const koCommonContent = {
    welcome: "환영합니다",
    greeting: "안녕하세요",
    goodbye: "안녕히 가세요",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    success: "성공했습니다",
    cancel: "취소",
    confirm: "확인",
    save: "저장",
    delete: "삭제",
    edit: "편집",
    add: "추가",
    search: "검색",
    filter: "필터",
    sort: "정렬",
    refresh: "새로고침",
    back: "뒤로",
    next: "다음",
    previous: "이전",
    home: "홈",
    about: "소개",
    contact: "연락처",
    settings: "설정",
    profile: "프로필",
    logout: "로그아웃",
    login: "로그인",
    register: "회원가입",
    email: "이메일",
    password: "비밀번호",
    username: "사용자명",
    name: "이름",
    phone: "전화번호",
    address: "주소",
    city: "도시",
    country: "국가",
    language: "언어",
    theme: "테마",
    dark: "다크",
    light: "라이트",
    auto: "자동"
  };

  // 영어 번역 파일
  const enCommonContent = {
    welcome: "Welcome",
    greeting: "Hello",
    goodbye: "Goodbye",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    back: "Back",
    next: "Next",
    previous: "Previous",
    home: "Home",
    about: "About",
    contact: "Contact",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    username: "Username",
    name: "Name",
    phone: "Phone",
    address: "Address",
    city: "City",
    country: "Country",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    auto: "Auto"
  };

  // 번역 파일 생성
  await fs.ensureDir(path.join(cwd, 'translations', 'ko'));
  await fs.ensureDir(path.join(cwd, 'translations', 'en'));

  await fs.writeJson(path.join(cwd, 'translations', 'ko', 'common.json'), koCommonContent, { spaces: 2 });
  await fs.writeJson(path.join(cwd, 'translations', 'en', 'common.json'), enCommonContent, { spaces: 2 });

  console.log(chalk.green('✅ Created translations/ko/common.json'));
  console.log(chalk.green('✅ Created translations/en/common.json'));

  // README 파일 생성
  const readmeContent = `# Translation Files

This directory contains translation files for hua-i18n-sdk.

## Structure

\`\`\`
translations/
├── ko/
│   └── common.json    # Korean translations
└── en/
    └── common.json    # English translations
\`\`\`

## Adding New Languages

1. Create a new directory for your language code (e.g., \`ja\` for Japanese)
2. Create \`common.json\` file with your translations
3. Update your i18n configuration to include the new language

## Adding New Namespaces

1. Create a new JSON file in each language directory (e.g., \`auth.json\`)
2. Add your translations to the new file
3. Update your i18n configuration to include the new namespace

## Example

\`\`\`json
{
  "welcome": "환영합니다",
  "greeting": "안녕하세요",
  "goodbye": "안녕히 가세요"
}
\`\`\`

For more information, visit: https://github.com/HUA-Labs/i18n-sdk
`;

  await fs.writeFile(path.join(cwd, 'translations', 'README.md'), readmeContent);
  console.log(chalk.green('✅ Created translations/README.md'));
} 