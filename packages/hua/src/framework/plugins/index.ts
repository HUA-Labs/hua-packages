/**
 * @hua-labs/hua/framework - Plugin System
 * 
 * 플러그인 시스템 메인 export
 */

export { 
  pluginRegistry, 
  registerPlugin, 
  getPlugin, 
  getAllPlugins 
} from './registry';
export type { HuaPlugin } from './types';
