import { describe, it, expect } from 'vitest';
import { getDefaultTranslations, getAllDefaultTranslations } from '../utils/default-translations';

describe('default-translations', () => {
  describe('getDefaultTranslations', () => {
    it('should return translations for valid language and namespace', () => {
      const koCommon = getDefaultTranslations('ko', 'common');
      expect(koCommon).toBeDefined();
      expect(koCommon.welcome).toBe('환영합니다');
      expect(koCommon.greeting).toBe('안녕하세요');
      expect(koCommon.goodbye).toBe('안녕히 가세요');
    });

    it('should return Korean common translations', () => {
      const translations = getDefaultTranslations('ko', 'common');
      expect(translations.loading).toBe('로딩 중...');
      expect(translations.error).toBe('오류가 발생했습니다');
      expect(translations.success).toBe('성공했습니다');
      expect(translations.cancel).toBe('취소');
      expect(translations.confirm).toBe('확인');
    });

    it('should return Korean auth translations', () => {
      const translations = getDefaultTranslations('ko', 'auth');
      expect(translations.login).toBe('로그인');
      expect(translations.logout).toBe('로그아웃');
      expect(translations.register).toBe('회원가입');
      expect(translations.email).toBe('이메일');
      expect(translations.password).toBe('비밀번호');
      expect(translations.forgot_password).toBe('비밀번호 찾기');
      expect(translations.remember_me).toBe('로그인 상태 유지');
    });

    it('should return Korean errors translations', () => {
      const translations = getDefaultTranslations('ko', 'errors');
      expect(translations.not_found).toBe('페이지를 찾을 수 없습니다');
      expect(translations.server_error).toBe('서버 오류가 발생했습니다');
      expect(translations.network_error).toBe('네트워크 오류가 발생했습니다');
      expect(translations.unauthorized).toBe('인증이 필요합니다');
      expect(translations.forbidden).toBe('접근이 거부되었습니다');
    });

    it('should return English common translations', () => {
      const translations = getDefaultTranslations('en', 'common');
      expect(translations.welcome).toBe('Welcome');
      expect(translations.greeting).toBe('Hello');
      expect(translations.goodbye).toBe('Goodbye');
      expect(translations.loading).toBe('Loading...');
      expect(translations.error).toBe('An error occurred');
      expect(translations.success).toBe('Success');
    });

    it('should return English auth translations', () => {
      const translations = getDefaultTranslations('en', 'auth');
      expect(translations.login).toBe('Login');
      expect(translations.logout).toBe('Logout');
      expect(translations.register).toBe('Register');
      expect(translations.email).toBe('Email');
      expect(translations.password).toBe('Password');
      expect(translations.forgot_password).toBe('Forgot Password');
      expect(translations.remember_me).toBe('Remember Me');
    });

    it('should return English errors translations', () => {
      const translations = getDefaultTranslations('en', 'errors');
      expect(translations.not_found).toBe('Page not found');
      expect(translations.server_error).toBe('Server error occurred');
      expect(translations.network_error).toBe('Network error occurred');
      expect(translations.unauthorized).toBe('Authentication required');
      expect(translations.forbidden).toBe('Access denied');
    });

    it('should return empty object for invalid language', () => {
      const translations = getDefaultTranslations('fr', 'common');
      expect(translations).toEqual({});
    });

    it('should return empty object for invalid namespace', () => {
      const translations = getDefaultTranslations('ko', 'invalid');
      expect(translations).toEqual({});
    });

    it('should return empty object for both invalid language and namespace', () => {
      const translations = getDefaultTranslations('fr', 'invalid');
      expect(translations).toEqual({});
    });

    it('should return empty object for undefined language', () => {
      const translations = getDefaultTranslations('', 'common');
      expect(translations).toEqual({});
    });

    it('should return empty object for undefined namespace', () => {
      const translations = getDefaultTranslations('ko', '');
      expect(translations).toEqual({});
    });
  });

  describe('getAllDefaultTranslations', () => {
    it('should return complete translations structure', () => {
      const all = getAllDefaultTranslations();
      expect(all).toBeDefined();
      expect(all.ko).toBeDefined();
      expect(all.en).toBeDefined();
    });

    it('should include all Korean namespaces', () => {
      const all = getAllDefaultTranslations();
      expect(all.ko.common).toBeDefined();
      expect(all.ko.auth).toBeDefined();
      expect(all.ko.errors).toBeDefined();
    });

    it('should include all English namespaces', () => {
      const all = getAllDefaultTranslations();
      expect(all.en.common).toBeDefined();
      expect(all.en.auth).toBeDefined();
      expect(all.en.errors).toBeDefined();
    });

    it('should have matching keys across languages', () => {
      const all = getAllDefaultTranslations();
      const koCommonKeys = Object.keys(all.ko.common);
      const enCommonKeys = Object.keys(all.en.common);
      expect(koCommonKeys).toEqual(enCommonKeys);
    });

    it('should have matching keys for auth namespace', () => {
      const all = getAllDefaultTranslations();
      const koAuthKeys = Object.keys(all.ko.auth);
      const enAuthKeys = Object.keys(all.en.auth);
      expect(koAuthKeys).toEqual(enAuthKeys);
    });

    it('should have matching keys for errors namespace', () => {
      const all = getAllDefaultTranslations();
      const koErrorsKeys = Object.keys(all.ko.errors);
      const enErrorsKeys = Object.keys(all.en.errors);
      expect(koErrorsKeys).toEqual(enErrorsKeys);
    });

    it('should return same reference on multiple calls', () => {
      const all1 = getAllDefaultTranslations();
      const all2 = getAllDefaultTranslations();
      expect(all1).toBe(all2);
    });

    it('should contain expected number of common keys', () => {
      const all = getAllDefaultTranslations();
      const commonKeys = Object.keys(all.ko.common);
      expect(commonKeys.length).toBeGreaterThan(15);
      expect(commonKeys).toContain('welcome');
      expect(commonKeys).toContain('greeting');
      expect(commonKeys).toContain('loading');
      expect(commonKeys).toContain('error');
      expect(commonKeys).toContain('success');
    });

    it('should contain expected auth keys', () => {
      const all = getAllDefaultTranslations();
      const authKeys = Object.keys(all.ko.auth);
      expect(authKeys).toContain('login');
      expect(authKeys).toContain('logout');
      expect(authKeys).toContain('register');
      expect(authKeys).toContain('email');
      expect(authKeys).toContain('password');
    });

    it('should contain expected error keys', () => {
      const all = getAllDefaultTranslations();
      const errorKeys = Object.keys(all.ko.errors);
      expect(errorKeys).toContain('not_found');
      expect(errorKeys).toContain('server_error');
      expect(errorKeys).toContain('network_error');
      expect(errorKeys).toContain('unauthorized');
      expect(errorKeys).toContain('forbidden');
    });
  });
});
