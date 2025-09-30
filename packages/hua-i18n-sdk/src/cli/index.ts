#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('i18n-cli')
  .description('HUA i18n SDK CLI tool for translation management')
  .version('1.0.0');

// 번역 파일 생성 명령어
program
  .command('generate')
  .description('Generate translation files from templates')
  .option('-l, --languages <languages>', 'Comma-separated list of languages', 'ko,en,ja')
  .option('-n, --namespaces <namespaces>', 'Comma-separated list of namespaces', 'common')
  .option('-o, --output <output>', 'Output directory', './translations')
  .option('-t, --template <template>', 'Template type', 'basic')
  .action(async (options) => {
    const languages = options.languages.split(',');
    const namespaces = options.namespaces.split(',');
    const outputDir = options.output;
    const template = options.template;

    console.log('🚀 Generating translation files...');
    console.log(`Languages: ${languages.join(', ')}`);
    console.log(`Namespaces: ${namespaces.join(', ')}`);
    console.log(`Output: ${outputDir}`);

    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 각 언어별 디렉토리 생성
    for (const language of languages) {
      const langDir = path.join(outputDir, language);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      // 각 네임스페이스별 파일 생성
      for (const namespace of namespaces) {
        const filePath = path.join(langDir, `${namespace}.json`);
        const templateContent = generateTemplate(template, language, namespace);
        
        fs.writeFileSync(filePath, JSON.stringify(templateContent, null, 2));
        console.log(`✅ Created: ${filePath}`);
      }
    }

    console.log('🎉 Translation files generated successfully!');
  });

// 번역 검증 명령어
program
  .command('validate')
  .description('Validate translation files')
  .option('-p, --path <path>', 'Path to translation files', './translations')
  .option('-l, --languages <languages>', 'Comma-separated list of languages to validate')
  .option('-n, --namespaces <namespaces>', 'Comma-separated list of namespaces to validate')
  .action(async (options) => {
    const translationsPath = options.path;
    const languages = options.languages ? options.languages.split(',') : null;
    const namespaces = options.namespaces ? options.namespaces.split(',') : null;

    console.log('🔍 Validating translation files...');

    if (!fs.existsSync(translationsPath)) {
      console.error('❌ Translation directory not found:', translationsPath);
      process.exit(1);
    }

    const validationResults = validateTranslations(translationsPath, languages, namespaces);
    
    if (validationResults.errors.length > 0) {
      console.log('❌ Validation failed:');
      validationResults.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
      process.exit(1);
    }

    console.log('✅ All translation files are valid!');
    console.log(`📊 Summary: ${validationResults.totalFiles} files, ${validationResults.totalKeys} keys`);
  });

// 번역 키 추출 명령어
program
  .command('extract')
  .description('Extract translation keys from source code')
  .option('-s, --source <source>', 'Source directory', './src')
  .option('-o, --output <output>', 'Output file', './extracted-keys.json')
  .option('-p, --pattern <pattern>', 'File pattern to search', '**/*.{ts,tsx,js,jsx}')
  .action(async (options) => {
    const sourceDir = options.source;
    const outputFile = options.output;
    const pattern = options.pattern;

    console.log('🔍 Extracting translation keys from source code...');
    console.log(`Source: ${sourceDir}`);
    console.log(`Pattern: ${pattern}`);

    // 실제 구현에서는 glob 패턴으로 파일 검색
    const extractedKeys = extractKeysFromSource(sourceDir, pattern);
    
    fs.writeFileSync(outputFile, JSON.stringify(extractedKeys, null, 2));
    console.log(`✅ Extracted ${Object.keys(extractedKeys).length} keys to ${outputFile}`);
  });

// 번역 통계 명령어
program
  .command('stats')
  .description('Show translation statistics')
  .option('-p, --path <path>', 'Path to translation files', './translations')
  .action(async (options) => {
    const translationsPath = options.path;

    console.log('📊 Translation Statistics');
    console.log('========================');

    if (!fs.existsSync(translationsPath)) {
      console.error('❌ Translation directory not found:', translationsPath);
      process.exit(1);
    }

    const stats = calculateTranslationStats(translationsPath);
    
    console.log(`Total Languages: ${stats.languages.length}`);
    console.log(`Total Namespaces: ${stats.namespaces.length}`);
    console.log(`Total Keys: ${stats.totalKeys}`);
    console.log(`Average Keys per Namespace: ${stats.averageKeysPerNamespace.toFixed(1)}`);
    
    console.log('\nLanguages:');
    stats.languages.forEach(lang => {
      console.log(`  - ${lang}: ${stats.keysPerLanguage[lang]} keys`);
    });

    console.log('\nNamespaces:');
    stats.namespaces.forEach(ns => {
      console.log(`  - ${ns}: ${stats.keysPerNamespace[ns]} keys`);
    });
  });

// 템플릿 생성 함수
function generateTemplate(template: string, language: string, namespace: string) {
  const templates = {
    basic: {
      welcome: getWelcomeText(language),
      hello: getHelloText(language),
      goodbye: getGoodbyeText(language),
      loading: getLoadingText(language),
      error: getErrorText(language),
      success: getSuccessText(language)
    },
    auth: {
      login: getLoginText(language),
      logout: getLogoutText(language),
      register: getRegisterText(language),
      password: getPasswordText(language),
      email: getEmailText(language)
    },
    form: {
      submit: getSubmitText(language),
      cancel: getCancelText(language),
      save: getSaveText(language),
      delete: getDeleteText(language),
      edit: getEditText(language)
    }
  };

  return templates[template as keyof typeof templates] || templates.basic;
}

// 언어별 텍스트 함수들
function getWelcomeText(lang: string): string {
  const texts = { ko: '환영합니다', en: 'Welcome', ja: 'ようこそ' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getHelloText(lang: string): string {
  const texts = { ko: '안녕하세요', en: 'Hello', ja: 'こんにちは' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getGoodbyeText(lang: string): string {
  const texts = { ko: '안녕히 가세요', en: 'Goodbye', ja: 'さようなら' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getLoadingText(lang: string): string {
  const texts = { ko: '로딩 중...', en: 'Loading...', ja: '読み込み中...' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getErrorText(lang: string): string {
  const texts = { ko: '오류가 발생했습니다', en: 'An error occurred', ja: 'エラーが発生しました' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getSuccessText(lang: string): string {
  const texts = { ko: '성공했습니다', en: 'Success', ja: '成功しました' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getLoginText(lang: string): string {
  const texts = { ko: '로그인', en: 'Login', ja: 'ログイン' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getLogoutText(lang: string): string {
  const texts = { ko: '로그아웃', en: 'Logout', ja: 'ログアウト' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getRegisterText(lang: string): string {
  const texts = { ko: '회원가입', en: 'Register', ja: '登録' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getPasswordText(lang: string): string {
  const texts = { ko: '비밀번호', en: 'Password', ja: 'パスワード' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getEmailText(lang: string): string {
  const texts = { ko: '이메일', en: 'Email', ja: 'メール' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getSubmitText(lang: string): string {
  const texts = { ko: '제출', en: 'Submit', ja: '送信' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getCancelText(lang: string): string {
  const texts = { ko: '취소', en: 'Cancel', ja: 'キャンセル' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getSaveText(lang: string): string {
  const texts = { ko: '저장', en: 'Save', ja: '保存' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getDeleteText(lang: string): string {
  const texts = { ko: '삭제', en: 'Delete', ja: '削除' };
  return texts[lang as keyof typeof texts] || texts.en;
}

function getEditText(lang: string): string {
  const texts = { ko: '편집', en: 'Edit', ja: '編集' };
  return texts[lang as keyof typeof texts] || texts.en;
}

// 번역 검증 함수
function validateTranslations(translationsPath: string, languages?: string[], namespaces?: string[]) {
  const errors: string[] = [];
  let totalFiles = 0;
  let totalKeys = 0;

  try {
    const langDirs = fs.readdirSync(translationsPath);
    
    for (const langDir of langDirs) {
      if (languages && !languages.includes(langDir)) continue;
      
      const langPath = path.join(translationsPath, langDir);
      const stat = fs.statSync(langPath);
      
      if (!stat.isDirectory()) continue;

      const files = fs.readdirSync(langPath);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const namespace = file.replace('.json', '');
        if (namespaces && !namespaces.includes(namespace)) continue;

        const filePath = path.join(langPath, file);
        totalFiles++;

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const translations = JSON.parse(content);
          
          if (typeof translations !== 'object' || translations === null) {
            errors.push(`${filePath}: Invalid JSON structure`);
            continue;
          }

          const keys = Object.keys(translations);
          totalKeys += keys.length;

          // 빈 파일 체크
          if (keys.length === 0) {
            errors.push(`${filePath}: Empty translation file`);
          }

          // 키 유효성 체크
          for (const key of keys) {
            if (typeof translations[key] !== 'string') {
              errors.push(`${filePath}: Key "${key}" is not a string`);
            }
          }

        } catch (error) {
          errors.push(`${filePath}: Invalid JSON - ${error}`);
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to read translations directory: ${error}`);
  }

  return { errors, totalFiles, totalKeys };
}

// 키 추출 함수 (간단한 구현)
function extractKeysFromSource(sourceDir: string, pattern: string) {
  // 실제 구현에서는 glob 패턴으로 파일 검색 및 AST 파싱
  const extractedKeys: Record<string, string[]> = {
    'common': ['welcome', 'hello', 'goodbye'],
    'auth': ['login', 'logout', 'register'],
    'form': ['submit', 'cancel', 'save']
  };

  return extractedKeys;
}

// 통계 계산 함수
function calculateTranslationStats(translationsPath: string) {
  const languages: string[] = [];
  const namespaces: string[] = [];
  const keysPerLanguage: Record<string, number> = {};
  const keysPerNamespace: Record<string, number> = {};
  let totalKeys = 0;

  try {
    const langDirs = fs.readdirSync(translationsPath);
    
    for (const langDir of langDirs) {
      const langPath = path.join(translationsPath, langDir);
      const stat = fs.statSync(langPath);
      
      if (!stat.isDirectory()) continue;

      languages.push(langDir);
      keysPerLanguage[langDir] = 0;

      const files = fs.readdirSync(langPath);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const namespace = file.replace('.json', '');
        if (!namespaces.includes(namespace)) {
          namespaces.push(namespace);
          keysPerNamespace[namespace] = 0;
        }

        const filePath = path.join(langPath, file);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const translations = JSON.parse(content);
          
          const keys = Object.keys(translations);
          totalKeys += keys.length;
          keysPerLanguage[langDir] += keys.length;
          keysPerNamespace[namespace] += keys.length;

        } catch (error) {
          console.warn(`Warning: Could not parse ${filePath}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading translations: ${error}`);
  }

  return {
    languages,
    namespaces,
    totalKeys,
    keysPerLanguage,
    keysPerNamespace,
    averageKeysPerNamespace: namespaces.length > 0 ? totalKeys / namespaces.length : 0
  };
}

program.parse(); 