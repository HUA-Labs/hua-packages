#!/usr/bin/env tsx
/**
 * Documentation SSOT Generator
 *
 * 패키지의 doc.yaml + package.json + src/index.ts 를 읽어
 * README.md 와 ai.yaml 을 생성합니다.
 *
 * Usage:
 *   pnpm generate:docs                     # 전체 패키지 생성
 *   pnpm generate:docs --package hua-i18n-core  # 특정 패키지만
 *   pnpm generate:docs --validate           # drift 검증 (CI용)
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  readdirSync,
  mkdirSync,
  realpathSync,
} from "fs";
import { createHash } from "crypto";
import { join, resolve, dirname, sep } from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { parse as parseYaml } from "yaml";
import {
  buildDocumentationAxProjection,
  buildPackageAxCatalog,
  summarizeHuaPackageAxCatalog,
} from "./package-ax.mjs";

// ─── Types ───────────────────────────────────────────────────────────

interface DocYaml {
  overview: string;
  features: string[];
  quickStart: string;
  codeBlockLang?: string;
  readme?: {
    features?: string[];
    featureLimit?: number;
    quickStart?: string;
    codeBlockLang?: string;
    hideApi?: boolean;
    hideSections?: boolean;
    detailedGuide?: string;
    aiGuide?: string;
  };
  docsUrl?: string;
  detailedGuide?: {
    path: string;
    distribution: "packed" | "repository";
    description: string;
  };
  apiNotes?: Record<
    string,
    { description: string; kind?: string; importFrom?: string }
  >;
  apiFilter?: "all" | "notes-only"; // 'notes-only' = only show exports in apiNotes
  related?: string[];
  sections?: Array<{ title: string; content: string }>;
  subpathExports?: Array<{ path: string; description: string }>;
  registry?: {
    category?: string;
    useCases?: string[];
    related?: string[];
  };
}

interface ExportInfo {
  name: string;
  kind: string; // 'function' | 'component' | 'hook' | 'class' | 'type' | 'const' | 'interface'
  description: string;
}

interface PublicCoreProfileEntry {
  subpath: string;
  disposition: "retained" | "deferred";
  kind: "javascript" | "asset";
  manifestTarget: unknown;
  tsup: null | { entry: string; source: string; output: string };
}

interface PublicCoreProfileProjection {
  schema: "hua-ui-public-core-profile.v1";
  digest: string;
  installedEngineRange: string;
  futureMajorEngineStop: string;
  releaseSelection: null;
  retained: string[];
  deferred: string[];
  javascriptCount: number;
  assetCount: number;
}

interface PackageData {
  dirName: string;
  shortName: string; // npm scope 제거한 이름
  fullName: string; // @hua-labs/xxx
  version: string;
  description: string;
  nodeEngine: string;
  peerDeps: Record<string, string>;
  peerDepsList: string;
  reactMajor?: string;
  exports: ExportInfo[];
  readmeFeatures: string[];
  showReadmeApi: boolean;
  showReadmeSections: boolean;
  legacyDetailedGuide?: string;
  detailedGuide?: {
    state: "shipped" | "repository-only";
    path: string;
    distribution: "packed" | "repository";
    description: string;
    packed: boolean;
    link: string;
  };
  documentationAx: { state: "absent" | "shipped" | "repository-only" };
  axSummary?: ReturnType<typeof summarizeHuaPackageAxCatalog> | null;
  aiGuide?: string;
  // from doc.yaml
  overview: string;
  features: string[];
  quickStart: string;
  codeBlockLang: string;
  docsUrl?: string;
  related?: string[];
  sections?: Array<{ title: string; content: string }>;
  subpathExports?: Array<{ path: string; description: string }>;
  publicCoreProfile?: PublicCoreProfileProjection;
}

// ─── Constants ───────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const PACKAGES_DIR = join(ROOT, "packages");
const AI_DOCS_DIR = join(ROOT, "ai-docs");
const TEMPLATES_DIR = join(ROOT, "scripts", "templates");
const SAFE_PACKAGE_DIR = /^[a-z0-9][a-z0-9-]{0,127}$/;
const DOC_YAML_KEYS = new Set([
  "overview",
  "features",
  "quickStart",
  "codeBlockLang",
  "readme",
  "docsUrl",
  "detailedGuide",
  "apiNotes",
  "apiFilter",
  "related",
  "sections",
  "subpathExports",
  "registry",
]);
const README_KEYS = new Set([
  "features",
  "featureLimit",
  "quickStart",
  "codeBlockLang",
  "hideApi",
  "hideSections",
  "detailedGuide",
  "aiGuide",
]);
const PUBLIC_CORE_PROFILE_KEYS = new Set([
  "schema",
  "package",
  "installedEngineRange",
  "futureMajorEngineStop",
  "releaseSelection",
  "entries",
]);
const PUBLIC_CORE_ENTRY_KEYS = new Set([
  "subpath",
  "disposition",
  "kind",
  "manifestTarget",
  "tsup",
]);
const PUBLIC_CORE_TSUP_KEYS = new Set(["entry", "source", "output"]);
const UI_PROFILE_RETAINED_PREFIX =
  "Public 2.4 core candidate (source-ready only) retains exactly 27 package entries: ";
const UI_PROFILE_DEFERRED_PREFIX =
  "Public 2.4 core candidate defers exactly 10 package entries and they are unavailable: ";
const UI_PROFILE_AUTHORITY_BOUNDARY =
  "Source-ready is not release-ready: final tarball, DTS, installed-consumer, version, release-plan, and npm authority remain unproven.";

function assertExactKeys(
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const unknown = Object.keys(value)
    .filter((key) => !allowed.has(key))
    .sort();
  if (unknown.length > 0) {
    throw new Error(`${label} has unknown doc.yaml key: ${unknown[0]}`);
  }
}

function assertSafePackageDirName(dirName: string): void {
  if (!SAFE_PACKAGE_DIR.test(dirName)) {
    throw new Error("invalid package directory: expected a safe package name");
  }
}

function assertContainedDirectory(
  parent: string,
  candidate: string,
  label: string,
): void {
  let parentStats;
  let candidateStats;
  try {
    parentStats = lstatSync(parent);
    candidateStats = lstatSync(candidate);
  } catch {
    throw new Error(`${label} must be an existing regular directory`);
  }
  if (
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    !candidateStats.isDirectory() ||
    candidateStats.isSymbolicLink()
  ) {
    throw new Error(`${label} must be a regular directory`);
  }
  let realParent;
  let realCandidate;
  try {
    realParent = realpathSync(parent);
    realCandidate = realpathSync(candidate);
  } catch {
    throw new Error(`${label} could not be resolved safely`);
  }
  if (
    realCandidate !== realParent &&
    !realCandidate.startsWith(`${realParent}${sep}`)
  ) {
    throw new Error(`${label} must stay inside the public repository root`);
  }
}

function assertRegularFile(path: string, label: string): void {
  let stats;
  try {
    stats = lstatSync(path);
  } catch {
    throw new Error(`${label} must be an existing regular file`);
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`${label} must be a regular file`);
  }
}

function utf8Sorted(values: string[]): string[] {
  return [...values].sort((left, right) =>
    Buffer.from(left).compare(Buffer.from(right)),
  );
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function canonicalImport(packageName: string, subpath: string): string {
  return subpath === "." ? packageName : `${packageName}${subpath.slice(1)}`;
}

function collectManifestTargetStrings(
  value: unknown,
  targets = new Set<string>(),
): Set<string> {
  if (typeof value === "string") {
    targets.add(value);
    return targets;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      "public-core-profile manifest targets must be strings or objects",
    );
  }
  for (const child of Object.values(value)) {
    collectManifestTargetStrings(child, targets);
  }
  return targets;
}

function loadPublicCoreProfile(options: {
  packageDir: string;
  packageName: string;
  packageEngine: unknown;
  manifestExports: unknown;
  docFeatures: string[];
}): {
  projection: PublicCoreProfileProjection;
  entries: PublicCoreProfileEntry[];
} | null {
  const profilePath = join(options.packageDir, "public-core-profile.json");
  if (!existsSync(profilePath)) return null;
  assertRegularFile(profilePath, "public-core-profile.json");
  const profileBytes = readFileSync(profilePath);
  if (profileBytes.length === 0 || profileBytes.length > 256 * 1024) {
    throw new Error("public-core-profile.json must be bounded and non-empty");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(profileBytes.toString("utf8"));
  } catch {
    throw new Error("public-core-profile.json must contain valid JSON");
  }
  assertExactKeys(raw, PUBLIC_CORE_PROFILE_KEYS, "public-core-profile.json");
  if (raw.schema !== "hua-ui-public-core-profile.v1") {
    throw new Error("public-core-profile.json has an unsupported schema");
  }
  if (raw.package !== options.packageName) {
    throw new Error(
      "public-core-profile.json package does not match package.json",
    );
  }
  if (
    typeof raw.installedEngineRange !== "string" ||
    raw.installedEngineRange !== options.packageEngine
  ) {
    throw new Error(
      "public-core-profile.json engine does not match package.json",
    );
  }
  if (raw.futureMajorEngineStop !== ">=22.3.0") {
    throw new Error(
      "public-core-profile.json future major stop must stay exact",
    );
  }
  if (raw.releaseSelection !== null) {
    throw new Error("public-core-profile.json must not select a release");
  }
  if (!Array.isArray(raw.entries) || raw.entries.length > 128) {
    throw new Error("public-core-profile.json entries must be a bounded array");
  }
  if (
    !options.manifestExports ||
    typeof options.manifestExports !== "object" ||
    Array.isArray(options.manifestExports)
  ) {
    throw new Error("profile-aware package.json exports must be an object");
  }

  const manifestExports = options.manifestExports as Record<string, unknown>;
  const entries: PublicCoreProfileEntry[] = [];
  const seen = new Set<string>();
  const seenTsupEntries = new Set<string>();
  const packageRoot = realpathSync(options.packageDir);
  for (const rawEntry of raw.entries) {
    assertExactKeys(
      rawEntry,
      PUBLIC_CORE_ENTRY_KEYS,
      "public-core-profile entry",
    );
    const subpath = rawEntry.subpath;
    if (
      typeof subpath !== "string" ||
      (subpath !== "." &&
        (!/^\.\/[A-Za-z0-9._/-]+$/u.test(subpath) ||
          subpath.includes("..") ||
          subpath.includes("//")))
    ) {
      throw new Error("public-core-profile entry has an unsafe subpath");
    }
    if (seen.has(subpath)) {
      throw new Error("public-core-profile entry subpaths must be unique");
    }
    seen.add(subpath);
    if (
      rawEntry.disposition !== "retained" &&
      rawEntry.disposition !== "deferred"
    ) {
      throw new Error("public-core-profile entry has an invalid disposition");
    }
    if (rawEntry.kind !== "javascript" && rawEntry.kind !== "asset") {
      throw new Error("public-core-profile entry has an invalid kind");
    }
    if (rawEntry.kind === "asset") {
      if (
        rawEntry.tsup !== null ||
        typeof rawEntry.manifestTarget !== "string"
      ) {
        throw new Error(
          "public-core-profile asset entry must be scalar and tsup-free",
        );
      }
    } else {
      assertExactKeys(
        rawEntry.tsup,
        PUBLIC_CORE_TSUP_KEYS,
        "public-core-profile tsup",
      );
      for (const key of PUBLIC_CORE_TSUP_KEYS) {
        const value = rawEntry.tsup[key];
        if (
          typeof value !== "string" ||
          value.length === 0 ||
          value.length > 256 ||
          value.includes("\0") ||
          value.includes("\r") ||
          value.includes("\n")
        ) {
          throw new Error(`public-core-profile tsup.${key} must be bounded`);
        }
      }
      if (
        !/^[A-Za-z0-9][A-Za-z0-9-]*$/u.test(rawEntry.tsup.entry) ||
        seenTsupEntries.has(rawEntry.tsup.entry) ||
        !/^src\/[A-Za-z0-9._/-]+\.[cm]?[jt]sx?$/u.test(rawEntry.tsup.source) ||
        rawEntry.tsup.source.includes("..") ||
        rawEntry.tsup.source.includes("//") ||
        rawEntry.tsup.output !== `dist/${rawEntry.tsup.entry}.mjs` ||
        !collectManifestTargetStrings(rawEntry.manifestTarget).has(
          `./${rawEntry.tsup.output}`,
        )
      ) {
        throw new Error("public-core-profile tsup authority is stale");
      }
      seenTsupEntries.add(rawEntry.tsup.entry);
      if (rawEntry.disposition === "retained") {
        const sourcePath = join(options.packageDir, rawEntry.tsup.source);
        assertRegularFile(sourcePath, "public-core-profile tsup source");
        if (!realpathSync(sourcePath).startsWith(`${packageRoot}${sep}`)) {
          throw new Error(
            "public-core-profile tsup source must stay inside package",
          );
        }
      }
    }

    const manifestTarget = manifestExports[subpath];
    if (rawEntry.disposition === "retained") {
      if (
        canonicalJson(manifestTarget) !== canonicalJson(rawEntry.manifestTarget)
      ) {
        throw new Error(
          `retained profile entry does not match package exports: ${subpath}`,
        );
      }
    } else if (manifestTarget !== undefined) {
      throw new Error(
        `deferred profile entry must be absent from package exports: ${subpath}`,
      );
    }
    entries.push(rawEntry as unknown as PublicCoreProfileEntry);
  }

  const retainedEntries = entries.filter(
    (entry) => entry.disposition === "retained",
  );
  const deferredEntries = entries.filter(
    (entry) => entry.disposition === "deferred",
  );
  if (
    entries.length !== 37 ||
    retainedEntries.length !== 27 ||
    deferredEntries.length !== 10 ||
    entries.filter((entry) => entry.kind === "javascript").length !== 30 ||
    entries.filter((entry) => entry.kind === "asset").length !== 7
  ) {
    throw new Error(
      "public-core-profile.json must remain exact 37=27/10 and 30/7",
    );
  }
  if (
    Object.keys(manifestExports).length !== retainedEntries.length ||
    Object.keys(manifestExports).some((subpath) => !seen.has(subpath))
  ) {
    throw new Error(
      "package exports must equal the retained public-core profile",
    );
  }

  const retained = utf8Sorted(
    retainedEntries.map((entry) =>
      canonicalImport(options.packageName, entry.subpath),
    ),
  );
  const deferred = utf8Sorted(
    deferredEntries.map((entry) =>
      canonicalImport(options.packageName, entry.subpath),
    ),
  );
  const requiredFeatures = [
    `${UI_PROFILE_RETAINED_PREFIX}${retained.join(", ")}.`,
    `${UI_PROFILE_DEFERRED_PREFIX}${deferred.join(", ")}.`,
    UI_PROFILE_AUTHORITY_BOUNDARY,
  ];
  for (const feature of requiredFeatures) {
    if (!options.docFeatures.includes(feature)) {
      throw new Error("doc.yaml public-core profile projection is stale");
    }
  }

  return {
    entries,
    projection: {
      schema: raw.schema,
      digest: createHash("sha256").update(profileBytes).digest("hex"),
      installedEngineRange: raw.installedEngineRange,
      futureMajorEngineStop: raw.futureMajorEngineStop,
      releaseSelection: null,
      retained,
      deferred,
      javascriptCount: 30,
      assetCount: 7,
    },
  };
}

function buildProfileDocumentationProjection(options: {
  detailedGuide: DocYaml["detailedGuide"];
  packageDir: string;
  packageFiles: unknown;
}): NonNullable<PackageData["detailedGuide"]> {
  const guide = options.detailedGuide;
  if (
    !guide ||
    guide.path !== "./DETAILED_GUIDE.md" ||
    guide.distribution !== "packed" ||
    guide.description !==
      "Full workspace usage plus the exact source-ready public 2.4 core-candidate boundary"
  ) {
    throw new Error("profile-aware detailed guide authority must stay exact");
  }
  if (
    !Array.isArray(options.packageFiles) ||
    !options.packageFiles.includes("DETAILED_GUIDE.md") ||
    options.packageFiles.includes("public-core-profile.json")
  ) {
    throw new Error(
      "profile-aware package files must ship only the guide authority",
    );
  }
  const guidePath = join(options.packageDir, "DETAILED_GUIDE.md");
  assertRegularFile(guidePath, "profile-aware detailed guide");
  const packageRoot = realpathSync(options.packageDir);
  const realGuide = realpathSync(guidePath);
  if (!realGuide.startsWith(`${packageRoot}${sep}`)) {
    throw new Error(
      "profile-aware detailed guide must stay inside the package",
    );
  }
  return {
    state: "shipped",
    path: guide.path,
    distribution: guide.distribution,
    description: guide.description,
    packed: true,
    link: guide.path,
  };
}

function assertWriterRoots(): void {
  assertContainedDirectory(ROOT, PACKAGES_DIR, "packages output root");
  assertContainedDirectory(ROOT, AI_DOCS_DIR, "AI output root");
  assertContainedDirectory(ROOT, TEMPLATES_DIR, "template root");
}

// ─── Export Parser ───────────────────────────────────────────────────

function parseExports(
  indexPath: string,
  apiNotes?: Record<string, { description: string; kind?: string }>,
): ExportInfo[] {
  if (!existsSync(indexPath)) return [];

  const raw = readFileSync(indexPath, "utf-8");
  // Strip block comments (JSDoc, multi-line) then line comments to avoid false positives
  const content = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const exports: ExportInfo[] = [];
  const seen = new Set<string>();

  function addExport(name: string, kind: string) {
    if (!name || seen.has(name)) return;
    seen.add(name);
    // apiNotes.kind overrides auto-detected kind
    const finalKind = apiNotes?.[name]?.kind ?? kind;
    exports.push({
      name,
      kind: finalKind,
      description: apiNotes?.[name]?.description ?? "",
    });
  }

  // Pattern 1: export { Foo, Bar } from './module'  AND  export { Foo, Bar };
  const reExportBraces = /^export\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/gm;
  let match: RegExpExecArray | null;
  while ((match = reExportBraces.exec(content)) !== null) {
    // Skip "export type {" — handled separately
    if (/^export\s+type\s*\{/.test(match[0])) continue;
    const names = match[1].split(",").map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const name of names) {
      addExport(name, classifyExport(name, false));
    }
  }

  // Pattern 2: export type { Foo } from './module'  AND  export type { Foo };
  const reTypeExport =
    /^export\s+type\s*\{([^}]+)\}(?:\s*from\s*['"][^'"]+['"])?/gm;
  while ((match = reTypeExport.exec(content)) !== null) {
    const names = match[1].split(",").map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim();
    });
    for (const name of names) {
      addExport(name, "type");
    }
  }

  // Pattern 3: export function foo / export const foo / export class Foo
  const reDirectExport =
    /^export\s+(?:(?:async\s+)?function|const|let|class)\s+(\w+)/gm;
  while ((match = reDirectExport.exec(content)) !== null) {
    const name = match[1];
    const isFunc = /export\s+(?:async\s+)?function/.test(match[0]);
    const isClass = /export\s+class/.test(match[0]);
    addExport(
      name,
      isClass ? "class" : isFunc ? classifyExport(name, true) : "const",
    );
  }

  return exports;
}

function classifyExport(name: string, isFuncDecl: boolean): string {
  if (/^use[A-Z]/.test(name)) return "hook";
  if (/^[A-Z]/.test(name) && !isFuncDecl) return "component";
  if (/^[A-Z]/.test(name) && isFuncDecl) return "function";
  return "function";
}

// ─── Package Data Loader ─────────────────────────────────────────────

async function loadPackageData(dirName: string): Promise<PackageData | null> {
  assertSafePackageDirName(dirName);
  const pkgDir = join(PACKAGES_DIR, dirName);
  const pkgJsonPath = join(pkgDir, "package.json");
  const docYamlPath = join(pkgDir, "doc.yaml");
  const indexPath = join(pkgDir, "src", "index.ts");

  if (!existsSync(pkgDir)) {
    console.warn(`  ⚠ ${dirName}: package directory not found, skipping`);
    return null;
  }
  assertContainedDirectory(PACKAGES_DIR, pkgDir, `${dirName}: package root`);

  if (!existsSync(pkgJsonPath)) {
    console.warn(`  ⚠ ${dirName}: package.json not found, skipping`);
    return null;
  }

  if (!existsSync(docYamlPath)) {
    console.warn(`  ⚠ ${dirName}: doc.yaml not found, skipping`);
    return null;
  }

  // Parse package.json
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
  const fullName = pkgJson.name as string;
  // @hua-labs/i18n-core → i18n-core, create-hua → create-hua
  const shortName = fullName.startsWith("@hua-labs/")
    ? fullName.replace("@hua-labs/", "")
    : fullName;

  const rawPeerDeps: Record<string, string> = pkgJson.peerDependencies ?? {};
  // Clean version for display: ">=19.0.0" → "19", "^5.0.0" → "5"
  const peerDeps: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawPeerDeps)) {
    peerDeps[k] = v;
  }
  const peerDepsList = Object.entries(rawPeerDeps)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");

  // Extract clean major version for badge (>=19.0.0 → 19)
  const reactMajor = rawPeerDeps.react?.match(/(\d+)/)?.[1];

  // Parse doc.yaml
  const docYaml: DocYaml = parseYaml(readFileSync(docYamlPath, "utf-8"));
  assertExactKeys(docYaml, DOC_YAML_KEYS, `${dirName}: doc.yaml`);
  if (docYaml.readme !== undefined) {
    assertExactKeys(docYaml.readme, README_KEYS, `${dirName}: readme`);
  }
  if (
    docYaml.detailedGuide !== undefined &&
    docYaml.readme?.detailedGuide !== undefined
  ) {
    throw new Error(
      `${dirName}: detailedGuide authority cannot be declared twice`,
    );
  }
  const readmeFeatureLimit =
    typeof docYaml.readme?.featureLimit === "number"
      ? docYaml.readme.featureLimit
      : undefined;
  const readmeFeatures =
    docYaml.readme?.features ??
    (readmeFeatureLimit
      ? (docYaml.features ?? []).slice(0, readmeFeatureLimit)
      : (docYaml.features ?? []));

  const publicCoreProfile = loadPublicCoreProfile({
    packageDir: pkgDir,
    packageName: fullName,
    packageEngine: pkgJson.engines?.node,
    manifestExports: pkgJson.exports,
    docFeatures: docYaml.features ?? [],
  });
  if (fullName === "@hua-labs/ui" && !publicCoreProfile) {
    throw new Error("hua-ui requires public-core-profile.json authority");
  }
  const documentationAx = publicCoreProfile
    ? buildProfileDocumentationProjection({
        detailedGuide: docYaml.detailedGuide,
        packageDir: pkgDir,
        packageFiles: pkgJson.files,
      })
    : (buildDocumentationAxProjection({
        detailedGuide: docYaml.detailedGuide,
        packageDir: pkgDir,
        packageDirName: dirName,
      }) as PackageData["documentationAx"] &
        Partial<NonNullable<PackageData["detailedGuide"]>>);
  const retainedProfileImports = new Set(
    publicCoreProfile?.projection.retained ?? [],
  );
  const projectedApiNotes = publicCoreProfile
    ? Object.fromEntries(
        Object.entries(docYaml.apiNotes ?? {}).filter(([, note]) => {
          if (!note.importFrom || note.importFrom === fullName) return true;
          if (!note.importFrom.startsWith(`${fullName}/`)) return true;
          return retainedProfileImports.has(note.importFrom);
        }),
      )
    : docYaml.apiNotes;

  // Parse exports (filter to apiNotes-only when configured)
  let exports = parseExports(indexPath, projectedApiNotes);
  if (docYaml.apiFilter === "notes-only" && projectedApiNotes) {
    const noteKeys = new Set(Object.keys(projectedApiNotes));
    const detectedNames = new Set(exports.map((e) => e.name));
    exports = exports.filter((e) => noteKeys.has(e.name));
    // Add apiNotes entries not found in auto-detected exports (e.g., subpath-only exports)
    for (const [name, note] of Object.entries(projectedApiNotes)) {
      if (!detectedNames.has(name)) {
        exports.push({
          name,
          kind: note.kind ?? classifyExport(name, false),
          description: note.description,
        });
      }
    }
  }

  const axCatalog = await buildPackageAxCatalog({
    packageDirName: dirName,
    packageFullName: fullName,
    packageVersion: pkgJson.version,
  });

  return {
    dirName,
    shortName,
    fullName,
    version: pkgJson.version,
    description: pkgJson.description ?? "",
    nodeEngine: pkgJson.engines?.node ?? ">=20.0.0",
    peerDeps,
    peerDepsList,
    reactMajor,
    exports,
    readmeFeatures,
    showReadmeApi: docYaml.readme?.hideApi !== true,
    showReadmeSections: docYaml.readme?.hideSections !== true,
    legacyDetailedGuide: docYaml.readme?.detailedGuide,
    detailedGuide:
      documentationAx.state === "absent"
        ? undefined
        : (documentationAx as NonNullable<PackageData["detailedGuide"]>),
    documentationAx,
    axSummary: axCatalog ? summarizeHuaPackageAxCatalog(axCatalog) : null,
    aiGuide: docYaml.readme?.aiGuide,
    overview: docYaml.overview,
    features: docYaml.features ?? [],
    quickStart: docYaml.readme?.quickStart ?? docYaml.quickStart ?? "",
    codeBlockLang:
      docYaml.readme?.codeBlockLang ?? docYaml.codeBlockLang ?? "tsx",
    docsUrl: docYaml.docsUrl,
    related: docYaml.related,
    sections: docYaml.sections,
    subpathExports: publicCoreProfile
      ? publicCoreProfile.entries
          .filter(
            (entry) =>
              entry.disposition === "retained" && entry.subpath !== ".",
          )
          .map((entry) => ({
            path: entry.subpath.slice(2),
            description: `Retained public core ${entry.kind} entry.`,
          }))
      : docYaml.subpathExports,
    publicCoreProfile: publicCoreProfile?.projection,
  };
}

// ─── Generators ──────────────────────────────────────────────────────

function compileTemplate(name: string): HandlebarsTemplateDelegate {
  const tplPath = join(TEMPLATES_DIR, name);
  assertRegularFile(tplPath, `${name} template`);
  // Normalize to LF for consistent Handlebars output across platforms (Windows CRLF breaks standalone block removal)
  const tplSource = readFileSync(tplPath, "utf-8").replace(/\r\n/g, "\n");
  return Handlebars.compile(tplSource, { noEscape: true });
}

function generateReadme(data: PackageData): string {
  const template = compileTemplate("readme.hbs");
  // Normalize CRLF→LF first so \n{3,} collapse works correctly on Windows
  return (
    template(data)
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

function generateAiYaml(data: PackageData): string {
  const template = compileTemplate("ai-yaml.hbs");
  const generated =
    template(data)
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n";
  const yamlString = (value: string) => JSON.stringify(value);
  let result = generated.trimEnd();
  if (data.detailedGuide) {
    const guide = data.detailedGuide;
    result += `\n\ndocumentation:\n  detailedGuide:\n    state: ${yamlString(guide.state)}\n    path: ${yamlString(guide.path)}\n    distribution: ${yamlString(guide.distribution)}\n    description: ${yamlString(guide.description)}\n    link: ${yamlString(guide.link)}`;
  }
  if (data.publicCoreProfile) {
    const profile = data.publicCoreProfile;
    result += `\n\npublic_core_profile:\n  schema: ${yamlString(profile.schema)}\n  digest: ${yamlString(profile.digest)}\n  candidate_status: ${yamlString("source-ready")}\n  installed_engine_range: ${yamlString(profile.installedEngineRange)}\n  future_major_engine_stop: ${yamlString(profile.futureMajorEngineStop)}\n  release_selection: null\n  entry_count: ${profile.retained.length + profile.deferred.length}\n  retained_count: ${profile.retained.length}\n  deferred_count: ${profile.deferred.length}\n  javascript_count: ${profile.javascriptCount}\n  asset_count: ${profile.assetCount}\n  retained:\n${profile.retained.map((entry) => `    - ${yamlString(entry)}`).join("\n")}\n  deferred:\n${profile.deferred.map((entry) => `    - ${yamlString(entry)}`).join("\n")}`;
  }
  return `${result}\n`;
}

// ─── AI-docs filename mapping ────────────────────────────────────────
// packages/hua-i18n-core → i18n-core.ai.yaml
// packages/hua → hua.ai.yaml
// packages/eslint-plugin-i18n → eslint-plugin-i18n.ai.yaml

function aiYamlFilename(dirName: string): string {
  const name = dirName.startsWith("hua-") ? dirName.slice(4) : dirName;
  return `${name}.ai.yaml`;
}

// ─── Commands ────────────────────────────────────────────────────────

function discoverPackages(): string[] {
  return readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => {
      const pkgJson = join(PACKAGES_DIR, name, "package.json");
      const docYaml = join(PACKAGES_DIR, name, "doc.yaml");
      return existsSync(pkgJson) && existsSync(docYaml);
    })
    .sort()
    .map((name) => {
      assertSafePackageDirName(name);
      return name;
    });
}

async function generate(packageFilter?: string): Promise<{
  generated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let generated = 0;
  mkdirSync(AI_DOCS_DIR, { recursive: true });
  assertWriterRoots();

  const dirs = packageFilter ? [packageFilter] : discoverPackages();

  for (const dirName of dirs) {
    try {
      const data = await loadPackageData(dirName);
      if (!data) {
        errors.push(`${dirName}: failed to load package data`);
        continue;
      }
      // Generate README.md
      const readmePath = join(PACKAGES_DIR, dirName, "README.md");
      if (existsSync(readmePath)) {
        assertRegularFile(readmePath, `${dirName}/README.md`);
      }
      const readmeContent = generateReadme(data);
      writeFileSync(readmePath, readmeContent, "utf-8");

      // Generate ai.yaml
      const aiYamlPath = join(AI_DOCS_DIR, aiYamlFilename(dirName));
      if (existsSync(aiYamlPath)) {
        assertRegularFile(aiYamlPath, aiYamlFilename(dirName));
      }
      const aiYamlContent = generateAiYaml(data);
      writeFileSync(aiYamlPath, aiYamlContent, "utf-8");

      console.log(
        `  ✓ ${data.fullName} → README.md + ${aiYamlFilename(dirName)}`,
      );
      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${dirName}: ${msg}`);
      console.error(`  ✗ ${dirName}: ${msg}`);
    }
  }

  return { generated, errors };
}

async function validate(packageFilter?: string): Promise<{
  valid: number;
  drifted: string[];
}> {
  const drifted: string[] = [];
  let valid = 0;
  assertWriterRoots();

  const dirs = packageFilter ? [packageFilter] : discoverPackages();

  for (const dirName of dirs) {
    try {
      const data = await loadPackageData(dirName);
      if (!data) {
        drifted.push(`${dirName}: failed to load`);
        continue;
      }

      let hasDrift = false;
      const norm = (s: string) => s.replace(/\r\n/g, "\n");

      const readmePath = join(PACKAGES_DIR, dirName, "README.md");
      if (existsSync(readmePath)) {
        assertRegularFile(readmePath, `${dirName}/README.md`);
        const current = norm(readFileSync(readmePath, "utf-8"));
        const expected = norm(generateReadme(data));
        if (current !== expected) {
          drifted.push(`${dirName}/README.md`);
          hasDrift = true;
        }
      } else {
        drifted.push(`${dirName}/README.md (missing)`);
        hasDrift = true;
      }

      const aiYamlPath = join(AI_DOCS_DIR, aiYamlFilename(dirName));
      if (existsSync(aiYamlPath)) {
        assertRegularFile(aiYamlPath, aiYamlFilename(dirName));
        const current = norm(readFileSync(aiYamlPath, "utf-8"));
        const expected = norm(generateAiYaml(data));
        if (current !== expected) {
          drifted.push(`${aiYamlFilename(dirName)}`);
          hasDrift = true;
        }
      } else {
        drifted.push(`${aiYamlFilename(dirName)} (missing)`);
        hasDrift = true;
      }

      if (!hasDrift) {
        valid++;
        console.log(`  ✓ ${data.fullName}`);
      } else {
        console.log(`  ✗ ${data.fullName} — drift detected`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      drifted.push(`${dirName}: ${message}`);
      console.error(`  ✗ ${dirName}: ${message}`);
    }
  }

  return { valid, drifted };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isValidate = args.includes("--validate");
  const pkgFlag = args.find((a) => a.startsWith("--package"));
  let packageFilter: string | undefined;

  if (pkgFlag) {
    const idx = args.indexOf(pkgFlag);
    // --package hua-i18n-core  or  --package=hua-i18n-core
    if (pkgFlag.includes("=")) {
      packageFilter = pkgFlag.split("=")[1];
    } else if (args[idx + 1]) {
      packageFilter = args[idx + 1];
    }
  }

  console.log(`\n📄 Documentation SSOT Generator\n`);

  if (isValidate) {
    console.log("Mode: validate (checking drift)\n");
    const { valid, drifted } = await validate(packageFilter);
    console.log(`\nResult: ${valid} valid, ${drifted.length} drifted`);
    if (drifted.length > 0) {
      console.log("\nDrifted files:");
      drifted.forEach((f) => console.log(`  - ${f}`));
      console.log("\nRun `pnpm generate:docs` to fix.\n");
      process.exit(1);
    }
    console.log("");
  } else {
    console.log("Mode: generate\n");
    const { generated, errors } = await generate(packageFilter);
    console.log(`\nResult: ${generated} generated, ${errors.length} errors`);
    if (errors.length > 0) {
      console.log("\nErrors:");
      errors.forEach((e) => console.log(`  - ${e}`));
      process.exitCode = 1;
    }
    console.log("");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Documentation writer failed: ${message}`);
  process.exitCode = 1;
});
