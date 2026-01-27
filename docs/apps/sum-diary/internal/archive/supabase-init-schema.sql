-- Supabase 초기 스키마 생성 SQL
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 1. user 스키마 생성
CREATE SCHEMA IF NOT EXISTS "user";

-- 2. admin 스키마 생성
CREATE SCHEMA IF NOT EXISTS "admin";

-- 3. 스키마 권한 설정
GRANT USAGE ON SCHEMA "user" TO postgres;
GRANT USAGE ON SCHEMA "admin" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "user" TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "admin" TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "user" TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "admin" TO postgres;

-- 4. 기본 확장 활성화 (필요시)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

