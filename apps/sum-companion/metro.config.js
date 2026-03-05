const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo for workspace package changes
config.watchFolders = [monorepoRoot];

// Resolve node_modules from both app and monorepo root (pnpm)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force singleton for React ecosystem packages.
// pnpm symlinks can cause Metro to bundle the same package from
// different filesystem paths, creating duplicate module instances.
const singletons = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
};

config.resolver.extraNodeModules = singletons;

// Map workspace subpath exports to source files (dist may not exist during dev)
const subpathAliases = {
  '@hua-labs/ui/native': path.resolve(monorepoRoot, 'packages/hua-ui/src/native/index.ts'),
  '@hua-labs/dot/native': path.resolve(monorepoRoot, 'packages/hua-dot/src/native.ts'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Resolve workspace subpath aliases to source
  if (subpathAliases[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: subpathAliases[moduleName],
    };
  }
  // If the module is a singleton, resolve it to the canonical path
  if (singletons[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
    };
  }
  // Fall back to default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
