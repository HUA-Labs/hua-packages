/**
 * prepare-publish.js
 *
 * npm pack 전에 workspace: 의존성을 publishable 버전으로 변환
 */

const fs = require("fs");
const path = require("path");

// npm pack은 패키지 디렉토리에서 실행되므로 process.cwd()가 패키지 경로
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

function findWorkspacePackage(depName) {
  const monorepoRoot = path.join(__dirname, "..");
  const packageName = depName.replace("@hua-labs/", "");
  const possiblePaths = [
    path.join(monorepoRoot, "packages", packageName, "package.json"),
    path.join(monorepoRoot, "packages", `hua-${packageName}`, "package.json"),
    path.join(
      monorepoRoot,
      "packages",
      packageName.replace("hua-", ""),
      "package.json",
    ),
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return JSON.parse(fs.readFileSync(possiblePath, "utf8"));
    }
  }

  return null;
}

function resolveWorkspaceSpec(depName, depVersion) {
  if (typeof depVersion !== "string" || !depVersion.startsWith("workspace:")) {
    return depVersion;
  }

  const workspaceSpec = depVersion.slice("workspace:".length);
  const depPackageJson = findWorkspacePackage(depName);
  const actualVersion = depPackageJson?.version;

  if (!actualVersion) {
    throw new Error(
      `Cannot resolve workspace dependency ${depName}: package not found`,
    );
  }

  if (workspaceSpec === "*") {
    return `^${actualVersion}`;
  }

  if (workspaceSpec === "^" || workspaceSpec === "~") {
    return `${workspaceSpec}${actualVersion}`;
  }

  if (workspaceSpec === "") {
    return actualVersion;
  }

  if (
    /^\d+\.\d+\.\d+(?:[-+].*)?$/.test(workspaceSpec) &&
    workspaceSpec !== actualVersion
  ) {
    throw new Error(
      `Workspace dependency ${depName} declares ${depVersion}, but package version is ${actualVersion}`,
    );
  }

  return workspaceSpec;
}

// workspace: 의존성을 publishable 버전으로 변환
function resolveWorkspaceDeps(deps) {
  if (!deps) return deps;

  const resolved = { ...deps };

  for (const [depName, depVersion] of Object.entries(deps)) {
    const resolvedVersion = resolveWorkspaceSpec(depName, depVersion);
    if (resolvedVersion !== depVersion) {
      resolved[depName] = resolvedVersion;
      console.log(`   ${depName}: ${depVersion} → ${resolvedVersion}`);
    }
  }

  return resolved;
}

// dependencies와 devDependencies 모두 변환
if (packageJson.dependencies) {
  packageJson.dependencies = resolveWorkspaceDeps(packageJson.dependencies);
}
if (packageJson.devDependencies) {
  packageJson.devDependencies = resolveWorkspaceDeps(
    packageJson.devDependencies,
  );
}
if (packageJson.peerDependencies) {
  // peerDependencies는 그대로 유지
}

// 변환된 package.json 저장
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

// 변환 결과 확인
const changedDeps = Object.entries(packageJson.dependencies || {}).filter(
  ([name, version]) =>
    typeof version === "string" &&
    !version.startsWith("workspace:") &&
    name.startsWith("@hua-labs/"),
);
console.log("✅ Prepared package.json for publishing (workspace: → versions)");
if (changedDeps.length > 0) {
  console.log(
    "   Changed dependencies:",
    changedDeps.map(([name, version]) => `${name}: ${version}`).join(", "),
  );
}
