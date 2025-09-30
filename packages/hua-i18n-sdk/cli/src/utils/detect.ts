import fs from 'fs-extra';
import path from 'path';

export type ProjectType = 'nextjs' | 'cra' | 'vite' | 'react';

export function detectProjectType(cwd: string): ProjectType | null {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }
    
    const packageJson = fs.readJsonSync(packageJsonPath);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Next.js 감지
    if (dependencies.next) {
      return 'nextjs';
    }
    
    // Create React App 감지
    if (dependencies['react-scripts']) {
      return 'cra';
    }
    
    // Vite 감지
    if (dependencies.vite) {
      return 'vite';
    }
    
    // React 프로젝트 감지
    if (dependencies.react) {
      return 'react';
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to detect project type:', error);
    return null;
  }
}

export function detectFramework(cwd: string): string | null {
  const projectType = detectProjectType(cwd);
  
  switch (projectType) {
    case 'nextjs':
      return 'Next.js';
    case 'cra':
      return 'Create React App';
    case 'vite':
      return 'Vite';
    case 'react':
      return 'React';
    default:
      return null;
  }
}

export function hasTypeScript(cwd: string): boolean {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    const tsConfigPath = path.join(cwd, 'tsconfig.json');
    
    if (fs.existsSync(tsConfigPath)) {
      return true;
    }
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      return !!dependencies.typescript;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

export function getSourceDirectory(cwd: string): string {
  // Next.js
  if (detectProjectType(cwd) === 'nextjs') {
    if (fs.existsSync(path.join(cwd, 'app'))) {
      return 'app'; // App Router
    }
    if (fs.existsSync(path.join(cwd, 'pages'))) {
      return 'pages'; // Pages Router
    }
    return 'src';
  }
  
  // Create React App
  if (detectProjectType(cwd) === 'cra') {
    return 'src';
  }
  
  // Vite
  if (detectProjectType(cwd) === 'vite') {
    return 'src';
  }
  
  // 기본값
  return 'src';
} 