/**
 * @hua-labs/hua/framework/config
 * 
 * Configuration entry point (server/client compatible)
 * 
 * This is a separate entry point from framework/index.ts to allow defineConfig
 * to be used in server-side configuration files (hua.config.ts) even when
 * framework/index.ts has 'use client' directive.
 */

// Client-safe exports only - loadConfig is server-only, import from '@hua-labs/hua/framework/server'
export { defineConfig, getConfig, setConfig, resetConfig } from './config/index';
export type { HuaConfig, PresetName } from './types';
