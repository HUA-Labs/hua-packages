import { lstatSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";

export const HUA_PACKAGE_AX_SCHEMA_VERSION = "hua-package-ax.v1";

const PACKAGE_AX_SOURCES = {
  "hua-dot": {
    catalogKind: "style-capability",
    modulePath: "packages/hua-dot/src/ax.ts",
    exportName: "getDotAxCatalog",
    sourcePath: "packages/hua-dot/src/ax.ts",
  },
};

const LEVEL_MAP = {
  native: "direct",
  direct: "direct",
  "selected-subset": "selected-subset",
  approximate: "approximate",
  "recipe-only": "recipe-only",
  "plugin-backed": "plugin-backed",
  "manifest-only": "manifest-only",
  "diagnostic-only": "diagnostic-only",
  planned: "planned",
  unsupported: "unsupported",
};

const SURFACE_LEVELS = new Set([
  "source",
  "package-export",
  "read-only-projection",
  "diagnostic-projection",
  "documentation",
  "runtime-adapter",
  "unsupported",
]);

const GUIDE_KEYS = new Set(["path", "distribution", "description"]);
const PACKAGE_DIR_NAME = /^[a-z0-9][a-z0-9-]{0,127}$/;

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .flatMap((key) =>
        value[key] === undefined ? [] : [[key, stableObject(value[key])]],
      ),
  );
}

function freezeDeep(value) {
  if (Array.isArray(value)) {
    for (const item of value) freezeDeep(item);
    return Object.freeze(value);
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) freezeDeep(item);
    return Object.freeze(value);
  }
  return value;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueSorted(values) {
  return [
    ...new Set(values.filter((value) => typeof value === "string")),
  ].sort();
}

function commonLevel(level) {
  return LEVEL_MAP[level] ?? "unsupported";
}

function hasAsciiControl(value) {
  return [...value].some((character) => {
    const code = character.codePointAt(0);
    return code !== undefined && (code <= 0x1f || code === 0x7f);
  });
}

export function executionForSupportLevel(level) {
  switch (commonLevel(level)) {
    case "direct":
    case "selected-subset":
    case "approximate":
      return "runtime";
    case "recipe-only":
    case "plugin-backed":
    case "manifest-only":
      return "declaration-only";
    case "diagnostic-only":
      return "diagnostic-only";
    case "planned":
    case "unsupported":
    default:
      return "none";
  }
}

function sourceRef(ref, fallbackRelation = "derived-from") {
  if (ref && typeof ref === "object") {
    return stableObject({
      path: String(ref.path ?? ""),
      exportName: ref.exportName ? String(ref.exportName) : undefined,
      relation: String(ref.relation ?? fallbackRelation),
    });
  }

  const raw = String(ref ?? "");
  const [path, exportName] = raw.split("#", 2);
  return stableObject({
    path,
    exportName: exportName || undefined,
    relation: fallbackRelation,
  });
}

function normalizeTargetSupport(target, support) {
  const packageLevel = String(support?.level ?? "unsupported");
  const level = commonLevel(packageLevel);
  return stableObject({
    target,
    level,
    execution: executionForSupportLevel(level),
    packageLevel: packageLevel === level ? undefined : packageLevel,
    notes: support?.notes ? String(support.notes) : undefined,
  });
}

function normalizeSurfaceSupport(surface) {
  const level = SURFACE_LEVELS.has(surface?.level)
    ? surface.level
    : "unsupported";
  return stableObject({
    surface: String(surface?.surface ?? "unknown"),
    level,
    sourceOfTruth: level === "source" || level === "package-export",
    notes: surface?.notes ? String(surface.notes) : undefined,
  });
}

function defaultSurfaces(source) {
  return [
    {
      surface: "package-export",
      level: "package-export",
      notes: `Derived from ${source.exportName}.`,
    },
    {
      surface: "docs",
      level: "documentation",
      notes:
        "Generated AI docs project a compact summary from package metadata.",
    },
  ];
}

function normalizeEntry(entry, source, catalogKind) {
  const supportRecord = entry?.support ?? {};
  const targetNames = uniqueSorted([
    ...asArray(entry?.targets),
    ...Object.keys(supportRecord),
  ]);
  const targets = targetNames.map((target) =>
    normalizeTargetSupport(target, supportRecord[target]),
  );
  const caveats = uniqueSorted([
    ...asArray(entry?.caveats).map(String),
    ...targets
      .filter((row) => row.execution !== "runtime")
      .map((row) => `${row.target}: ${row.level}`),
  ]);

  const packageSpecific = stableObject({
    allowedOptionalPeers: entry?.allowedOptionalPeers,
    canonicalImport: entry?.canonicalImport,
    deprecated: entry?.deprecated,
    reactNativeCanonicalImport: entry?.reactNativeCanonicalImport,
    replacementImports: entry?.replacementImports,
    routing: entry?.routing,
    properties: entry?.properties,
    composition: entry?.composition,
    hooks: entry?.hooks,
    profileKeys: entry?.profileKeys,
    supportsReducedMotionStrategy: entry?.supportsReducedMotionStrategy,
  });

  return stableObject({
    id: String(entry?.id ?? ""),
    kind:
      catalogKind === "style-capability"
        ? "style-family"
        : catalogKind === "motion-intent"
          ? "motion-intent"
          : catalogKind,
    label: String(entry?.label ?? entry?.id ?? ""),
    category: String(entry?.category ?? "uncategorized"),
    description: String(entry?.description ?? ""),
    stability: "stable",
    targets,
    surfaces: asArray(entry?.surfaces).map(normalizeSurfaceSupport),
    examples: asArray(entry?.examples).map((example) =>
      typeof example === "string" ? { value: example } : stableObject(example),
    ),
    caveats,
    provenance: asArray(entry?.provenance).length
      ? asArray(entry.provenance).map((ref) => sourceRef(ref))
      : [sourceRef({ path: source.sourcePath, exportName: source.exportName })],
    packageSpecific:
      Object.keys(packageSpecific).filter(
        (key) => packageSpecific[key] !== undefined,
      ).length > 0
        ? packageSpecific
        : undefined,
  });
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => String(a).localeCompare(String(b)))
    .map(([key, count]) => ({ key, count }));
}

export function summarizeHuaPackageAxCatalog(catalog) {
  const targetRows = catalog.entries.flatMap((entry) => entry.targets);
  const surfaceRows = catalog.entries.flatMap((entry) => entry.surfaces);
  return stableObject({
    schemaVersion: catalog.schemaVersion,
    catalogKind: catalog.catalogKind,
    sourcePackage: catalog.sourcePackage,
    sourceExport: catalog.generatedFrom[0]?.exportName,
    entryCount: catalog.entries.length,
    targetRowCount: targetRows.length,
    surfaceRowCount: surfaceRows.length,
    targets: catalog.targets,
    surfaces: catalog.surfaces,
    supportSummary: countBy(targetRows.map((row) => row.level)),
    executionSummary: countBy(targetRows.map((row) => row.execution)),
    caveatSummary: uniqueSorted(
      catalog.entries.flatMap((entry) => entry.caveats),
    ).slice(0, 8),
  });
}

export function normalizeHuaPackageAxCatalog(rawCatalog, source) {
  const catalogKind = source.catalogKind;
  const entries = asArray(rawCatalog?.entries ?? rawCatalog?.intents)
    .map((entry) => normalizeEntry(entry, source, catalogKind))
    .sort((a, b) => a.id.localeCompare(b.id));
  const catalogSurfaces = asArray(rawCatalog?.surfaces).length
    ? asArray(rawCatalog.surfaces).map((surface) =>
        typeof surface === "string"
          ? normalizeSurfaceSupport({
              surface,
              level: surface === "core" ? "source" : "read-only-projection",
            })
          : normalizeSurfaceSupport(surface),
      )
    : defaultSurfaces(source).map(normalizeSurfaceSupport);

  for (const entry of entries) {
    if (entry.surfaces.length === 0) entry.surfaces = catalogSurfaces;
  }

  return freezeDeep(
    stableObject({
      schemaVersion: HUA_PACKAGE_AX_SCHEMA_VERSION,
      sourcePackage: String(rawCatalog?.sourcePackage ?? source.sourcePackage),
      sourcePackageVersion: source.sourcePackageVersion,
      catalogKind,
      generatedFrom: [
        sourceRef({
          path: source.sourcePath,
          exportName: source.exportName,
          relation: "derived-from",
        }),
      ],
      targets: uniqueSorted(
        entries.flatMap((entry) => entry.targets.map((row) => row.target)),
      ),
      surfaces: uniqueSorted(
        entries.flatMap((entry) => entry.surfaces.map((row) => row.surface)),
      ),
      entries,
    }),
  );
}

export function buildPublicSurfaceDocsProjection({
  catalog,
  rootExportNames,
  routeExportNames,
  apiNotes,
}) {
  if (catalog?.catalogKind !== "public-surface") {
    throw new Error("docs projection requires a public-surface AX catalog");
  }

  const rootNames = new Set(asArray(rootExportNames));
  const exportedNamesByImport = new Map(
    Object.entries(routeExportNames ?? {}).map(([canonicalImport, names]) => [
      canonicalImport,
      new Set(asArray(names)),
    ]),
  );
  const routesByImport = new Map();
  const routes = catalog.entries.map((entry) => {
    const metadata = entry.packageSpecific ?? {};
    const canonicalImport = metadata.canonicalImport;
    if (typeof canonicalImport !== "string" || canonicalImport.length === 0) {
      throw new Error(`${entry.id} is missing canonicalImport metadata`);
    }
    if (routesByImport.has(canonicalImport)) {
      throw new Error(`${canonicalImport} is duplicated in the AX catalog`);
    }
    const route = stableObject({
      export: entry.id,
      canonicalImport,
      category: entry.category,
      description: entry.description,
      routing: metadata.routing,
      deprecated: metadata.deprecated,
      replacementImports: metadata.replacementImports,
      allowedOptionalPeers: metadata.allowedOptionalPeers,
      reactNativeCanonicalImport: metadata.reactNativeCanonicalImport,
      provides: [],
    });
    routesByImport.set(canonicalImport, route);
    return route;
  });

  const rootExports = [];
  for (const [name, note] of Object.entries(apiNotes ?? {})) {
    const isRootExport = rootNames.has(name);
    const importFrom =
      note?.importFrom ?? (isRootExport ? catalog.sourcePackage : undefined);
    if (typeof importFrom !== "string" || importFrom.length === 0) {
      throw new Error(
        `${name} requires importFrom because it is not exported by the root`,
      );
    }
    const route = routesByImport.get(importFrom);
    if (!route)
      throw new Error(`${name} names unknown catalog import ${importFrom}`);
    if (importFrom === catalog.sourcePackage && !isRootExport) {
      throw new Error(`${name} is not exported by the root`);
    }
    const exportedNames = exportedNamesByImport.get(importFrom);
    if (!exportedNames || !exportedNames.has(name)) {
      throw new Error(`${name} is not exported by ${importFrom}`);
    }
    const projected = stableObject({
      name,
      kind: note?.kind ?? "function",
      description: String(note?.description ?? ""),
    });
    route.provides.push(projected);
    if (importFrom === catalog.sourcePackage) rootExports.push(projected);
  }

  return freezeDeep(stableObject({ routes, rootExports }));
}

export function buildDocumentationAxProjection({
  detailedGuide,
  packageDir,
  packageDirName,
  packageFiles,
}) {
  if (detailedGuide === undefined) return freezeDeep({ state: "absent" });
  if (
    !detailedGuide ||
    typeof detailedGuide !== "object" ||
    Array.isArray(detailedGuide)
  ) {
    throw new Error("detailedGuide must be an object");
  }
  const unknownKeys = Object.keys(detailedGuide).filter(
    (key) => !GUIDE_KEYS.has(key),
  );
  if (unknownKeys.length > 0) {
    throw new Error(`detailedGuide has unknown key: ${unknownKeys.sort()[0]}`);
  }
  if (!PACKAGE_DIR_NAME.test(packageDirName)) {
    throw new Error("detailedGuide package directory is invalid");
  }

  const { path, distribution, description } = detailedGuide;
  if (
    typeof path !== "string" ||
    path.length > 256 ||
    !path.startsWith("./") ||
    path.includes("\\") ||
    hasAsciiControl(path) ||
    path.split("/").includes("..") ||
    path === "./"
  ) {
    throw new Error("detailedGuide.path must be a safe ./ path");
  }
  if (distribution !== "packed" && distribution !== "repository") {
    throw new Error("detailedGuide.distribution must be packed or repository");
  }
  if (
    typeof description !== "string" ||
    description.trim() === "" ||
    description.length > 512 ||
    description.includes("\0") ||
    description.includes("\r") ||
    description.includes("\n")
  ) {
    throw new Error("detailedGuide.description is required and bounded");
  }

  const exactPackageDir = resolve(packageDir);
  const guidePath = resolve(packageDir, path.slice(2));
  if (!guidePath.startsWith(`${exactPackageDir}${sep}`)) {
    throw new Error("detailedGuide.path must stay inside the package");
  }
  let guideStats;
  try {
    guideStats = lstatSync(guidePath);
  } catch {
    throw new Error("detailedGuide.path must name an existing regular file");
  }
  if (!guideStats.isFile() || guideStats.isSymbolicLink()) {
    throw new Error("detailedGuide.path must name an existing regular file");
  }
  const realPackageDir = realpathSync(exactPackageDir);
  const realGuidePath = realpathSync(guidePath);
  if (!realGuidePath.startsWith(`${realPackageDir}${sep}`)) {
    throw new Error("detailedGuide.path must stay inside the package");
  }

  const relativePath = path.slice(2);
  const files = Array.isArray(packageFiles) ? packageFiles : [];
  const admitted = files.includes(relativePath);
  if (distribution === "packed" && !admitted) {
    throw new Error(
      "packed detailedGuide.path must be named exactly in package files",
    );
  }
  if (distribution === "repository" && admitted) {
    throw new Error(
      "repository detailedGuide.path must not be named in package files",
    );
  }

  const packed = distribution === "packed";
  return freezeDeep(
    stableObject({
      state: packed ? "shipped" : "repository-only",
      path,
      distribution,
      description,
      packed,
      link: packed
        ? path
        : `https://github.com/HUA-Labs/hua-packages/blob/main/packages/${packageDirName}/${relativePath}`,
    }),
  );
}

export async function buildPackageAxCatalog({
  packageDirName,
  packageFullName,
  packageVersion,
}) {
  const source = PACKAGE_AX_SOURCES[packageDirName];
  if (!source) return null;

  const moduleUrl = new URL(`../${source.modulePath}`, import.meta.url);
  const module = await import(moduleUrl.href);
  const getCatalog = module[source.exportName];
  if (typeof getCatalog !== "function") {
    throw new Error(
      `${packageDirName}: missing AX source export ${source.exportName}`,
    );
  }

  return normalizeHuaPackageAxCatalog(getCatalog(), {
    ...source,
    sourcePackage: packageFullName,
    sourcePackageVersion: packageVersion,
  });
}

export async function buildPackageAxSummary({
  packageDirName,
  packageFullName,
  packageVersion,
}) {
  const normalized = await buildPackageAxCatalog({
    packageDirName,
    packageFullName,
    packageVersion,
  });
  return normalized ? summarizeHuaPackageAxCatalog(normalized) : null;
}
