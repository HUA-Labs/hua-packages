import { toCamelCase } from "./case-utils";

export type IconProviderName = "phosphor" | "lucide" | "iconsax";
export type IconProviderTier =
  | "default"
  | "optional"
  | "essential"
  | "full"
  | "unsupported";
export type IconProviderCapability =
  | "weights"
  | "line"
  | "bold"
  | "stroke-width";

export interface IconProviderBinding {
  readonly component: string | null;
  readonly requestedComponent?: string | null;
  readonly tier: IconProviderTier;
  readonly capabilities: readonly IconProviderCapability[];
}

export interface IconCatalogRecord {
  readonly id: string;
  readonly aliases: readonly string[];
  readonly projectSpellings: readonly string[];
  readonly providers: Readonly<Record<IconProviderName, IconProviderBinding>>;
}

const ICON_ID_PATTERN = /^[a-z][A-Za-z0-9]*$/;
const ICON_ALIAS_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;
const VENDOR_COMPONENT_PATTERN = /^[A-Z][A-Za-z0-9]*$/;

function validateProviderBinding(
  recordId: string,
  provider: IconProviderName,
  binding: IconProviderBinding,
  failures: string[],
): void {
  const location = `${recordId}.providers.${provider}`;
  if (
    binding.component !== null &&
    !VENDOR_COMPONENT_PATTERN.test(binding.component)
  ) {
    failures.push(`${location}.component is not a valid vendor name`);
  }
  if (
    binding.requestedComponent !== undefined &&
    binding.requestedComponent !== null &&
    !VENDOR_COMPONENT_PATTERN.test(binding.requestedComponent)
  ) {
    failures.push(`${location}.requestedComponent is not a valid vendor name`);
  }
  if (new Set(binding.capabilities).size !== binding.capabilities.length) {
    failures.push(`${location}.capabilities contains duplicates`);
  }
  if (
    provider === "phosphor" &&
    (binding.tier !== "default" ||
      binding.component === null ||
      JSON.stringify(binding.capabilities) !== JSON.stringify(["weights"]))
  ) {
    failures.push(`${location} must be a default weight-capable binding`);
  }
  if (provider === "lucide") {
    const isOptionalLine =
      binding.tier === "optional" &&
      binding.component !== null &&
      JSON.stringify(binding.capabilities) ===
        JSON.stringify(["line", "stroke-width"]);
    const isUnsupported =
      binding.tier === "unsupported" &&
      binding.component === null &&
      binding.capabilities.length === 0;
    if (!isOptionalLine && !isUnsupported) {
      failures.push(
        `${location} must be an optional line or unsupported binding`,
      );
    }
  }
  if (provider === "iconsax") {
    if (
      binding.tier === "unsupported" &&
      (binding.component !== null || binding.capabilities.length !== 0)
    ) {
      failures.push(
        `${location} unsupported binding cannot expose a component or capabilities`,
      );
    }
    if (
      (binding.tier === "essential" || binding.tier === "full") &&
      (binding.component === null ||
        JSON.stringify(binding.capabilities) !==
          JSON.stringify(["line", "bold"]))
    ) {
      failures.push(
        `${location} supported binding must expose line and bold capabilities`,
      );
    }
    if (!["essential", "full", "unsupported"].includes(binding.tier)) {
      failures.push(`${location} has invalid Iconsax tier ${binding.tier}`);
    }
  }
}

export function assertValidIconAliasGraph(
  ids: readonly string[],
  aliases: Readonly<Record<string, string>>,
): void {
  const failures: string[] = [];
  const idSet = new Set(ids);
  for (const [alias] of Object.entries(aliases)) {
    if (!ICON_ALIAS_PATTERN.test(alias))
      failures.push(`alias ${JSON.stringify(alias)} is invalid`);
    if (idSet.has(alias))
      failures.push(`alias ${alias} collides with canonical id`);
    const seen = new Set<string>();
    let cursor = alias;
    while (aliases[cursor] !== undefined) {
      if (seen.has(cursor)) {
        failures.push(`alias cycle contains ${cursor}`);
        break;
      }
      seen.add(cursor);
      cursor = aliases[cursor];
    }
    if (!idSet.has(cursor))
      failures.push(`alias ${alias} has missing target ${cursor}`);
  }
  if (failures.length > 0) {
    throw new Error(`Invalid icon alias graph:\n${failures.join("\n")}`);
  }
}

export function assertValidIconCatalogDefinition(
  records: readonly IconCatalogRecord[],
): void {
  const failures: string[] = [];
  const ids = new Set<string>();
  const aliases: Record<string, string> = Object.create(null);
  const projectSpellings = new Set<string>();
  for (const record of records) {
    if (!ICON_ID_PATTERN.test(record.id))
      failures.push(`canonical id ${JSON.stringify(record.id)} is invalid`);
    if (ids.has(record.id))
      failures.push(`duplicate canonical id ${record.id}`);
    ids.add(record.id);
    const providerKeys = Object.keys(record.providers).sort();
    if (
      JSON.stringify(providerKeys) !==
      JSON.stringify(["iconsax", "lucide", "phosphor"])
    ) {
      failures.push(`${record.id} must define exactly three providers`);
    }
    for (const provider of ["phosphor", "lucide", "iconsax"] as const) {
      const binding = record.providers[provider];
      if (!binding)
        failures.push(`${record.id} is missing provider ${provider}`);
      else validateProviderBinding(record.id, provider, binding, failures);
    }
    const localAliases = new Set<string>();
    for (const alias of record.aliases) {
      if (localAliases.has(alias))
        failures.push(`${record.id} repeats alias ${alias}`);
      localAliases.add(alias);
      if (aliases[alias] !== undefined && aliases[alias] !== record.id) {
        failures.push(
          `alias ${alias} targets both ${aliases[alias]} and ${record.id}`,
        );
      }
      aliases[alias] = record.id;
    }
    for (const spelling of record.projectSpellings) {
      if (projectSpellings.has(spelling))
        failures.push(`legacy project spelling ${spelling} is duplicated`);
      projectSpellings.add(spelling);
      if (spelling !== record.id && !localAliases.has(spelling)) {
        failures.push(
          `${record.id} project spelling ${spelling} is not its id or alias`,
        );
      }
    }
  }
  try {
    assertValidIconAliasGraph([...ids], aliases);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
  if (failures.length > 0) {
    throw new Error(`Invalid icon catalog:\n${failures.join("\n")}`);
  }
}

function defineIconCatalog(
  records: readonly IconCatalogRecord[],
): readonly IconCatalogRecord[] {
  const recordsWithDerivedCapabilities = records.map((record) => ({
    ...record,
    providers: {
      ...record.providers,
      lucide: {
        ...record.providers.lucide,
        capabilities: [
          ...record.providers.lucide.capabilities,
          ...(record.providers.lucide.component !== null &&
          !record.providers.lucide.capabilities.includes("stroke-width")
            ? (["stroke-width"] as const)
            : []),
        ],
      },
    },
  }));
  assertValidIconCatalogDefinition(recordsWithDerivedCapabilities);
  return Object.freeze(
    recordsWithDerivedCapabilities.map((record) =>
      Object.freeze({
        ...record,
        aliases: Object.freeze([...record.aliases]),
        projectSpellings: Object.freeze([...record.projectSpellings]),
        providers: Object.freeze({
          phosphor: Object.freeze({
            ...record.providers.phosphor,
            capabilities: Object.freeze([
              ...record.providers.phosphor.capabilities,
            ]),
          }),
          lucide: Object.freeze({
            ...record.providers.lucide,
            capabilities: Object.freeze([
              ...record.providers.lucide.capabilities,
            ]),
          }),
          iconsax: Object.freeze({
            ...record.providers.iconsax,
            capabilities: Object.freeze([
              ...record.providers.iconsax.capabilities,
            ]),
          }),
        }),
      }),
    ),
  );
}

/**
 * Semantic SSOT for every HUA UI icon spelling and provider binding.
 *
 * Runtime component registries are projections of this catalog. Optional
 * providers never infer PascalCase component names.
 */
const ICON_CATALOG_DEFINITION: readonly IconCatalogRecord[] = [
  {
    id: "home",
    aliases: ["house", "main"],
    projectSpellings: ["home"],
    providers: {
      phosphor: {
        component: "House",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Home",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Home2",
        requestedComponent: "Home2",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "layoutDashboard",
    aliases: ["layout-dashboard"],
    projectSpellings: ["layout-dashboard"],
    providers: {
      phosphor: {
        component: "SquaresFour",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "LayoutDashboard",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "folder",
    aliases: ["directory", "dir"],
    projectSpellings: ["folder"],
    providers: {
      phosphor: {
        component: "Folder",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Folder",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Folder",
        requestedComponent: "Folder",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "alertCircle",
    aliases: ["alert-circle"],
    projectSpellings: ["alert-circle", "alertCircle"],
    providers: {
      phosphor: {
        component: "WarningCircle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "AlertCircle",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Danger",
        requestedComponent: "Danger",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "columns",
    aliases: [],
    projectSpellings: ["columns"],
    providers: {
      phosphor: {
        component: "Columns",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Columns",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "users",
    aliases: ["people", "group", "team"],
    projectSpellings: ["users"],
    providers: {
      phosphor: {
        component: "Users",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Users",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "People",
        requestedComponent: "People",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "settings",
    aliases: ["gear", "config", "preferences", "prefs"],
    projectSpellings: ["settings"],
    providers: {
      phosphor: {
        component: "Gear",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Settings",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "menu",
    aliases: [],
    projectSpellings: ["menu"],
    providers: {
      phosphor: {
        component: "List",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Menu",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Menu",
        requestedComponent: "Menu",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "close",
    aliases: [],
    projectSpellings: ["close"],
    providers: {
      phosphor: {
        component: "X",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "X",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "CloseCircle",
        requestedComponent: "CloseCircle",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "chevronLeft",
    aliases: ["chevron-left"],
    projectSpellings: ["chevronLeft"],
    providers: {
      phosphor: {
        component: "CaretLeft",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ChevronLeft",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowLeft2",
        requestedComponent: "ArrowLeft2",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "chevronRight",
    aliases: ["chevron-right"],
    projectSpellings: ["chevronRight"],
    providers: {
      phosphor: {
        component: "CaretRight",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ChevronRight",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowRight2",
        requestedComponent: "ArrowRight2",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "chevronDown",
    aliases: ["chevron-down"],
    projectSpellings: ["chevronDown"],
    providers: {
      phosphor: {
        component: "CaretDown",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ChevronDown",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowDown2",
        requestedComponent: "ArrowDown2",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "chevronUp",
    aliases: ["chevron-up"],
    projectSpellings: ["chevronUp"],
    providers: {
      phosphor: {
        component: "CaretUp",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ChevronUp",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowUp2",
        requestedComponent: "ArrowUp2",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "arrowLeft",
    aliases: ["arrow-left", "back", "prev", "previous"],
    projectSpellings: ["arrowLeft"],
    providers: {
      phosphor: {
        component: "ArrowLeft",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ArrowLeft",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowLeft",
        requestedComponent: "ArrowLeft",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "arrowRight",
    aliases: ["arrow-right", "forward", "next"],
    projectSpellings: ["arrowRight"],
    providers: {
      phosphor: {
        component: "ArrowRight",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ArrowRight",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowRight",
        requestedComponent: "ArrowRight",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "arrowUp",
    aliases: ["arrow-up"],
    projectSpellings: ["arrowUp"],
    providers: {
      phosphor: {
        component: "ArrowUp",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ArrowUp",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowUp",
        requestedComponent: "ArrowUp",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "arrowDown",
    aliases: ["arrow-down"],
    projectSpellings: ["arrowDown"],
    providers: {
      phosphor: {
        component: "ArrowDown",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ArrowDown",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "ArrowDown",
        requestedComponent: "ArrowDown",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "add",
    aliases: ["plus", "new"],
    projectSpellings: ["add"],
    providers: {
      phosphor: {
        component: "Plus",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Plus",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Add",
        requestedComponent: "Add",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "edit",
    aliases: ["modify"],
    projectSpellings: ["edit"],
    providers: {
      phosphor: {
        component: "Pencil",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Edit",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "pencil",
    aliases: [],
    projectSpellings: ["pencil"],
    providers: {
      phosphor: {
        component: "Pencil",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Pencil",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "delete",
    aliases: ["trash"],
    projectSpellings: ["delete", "trash"],
    providers: {
      phosphor: {
        component: "Trash",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Trash2",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Trash",
        requestedComponent: "Trash",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "upload",
    aliases: ["post"],
    projectSpellings: ["upload"],
    providers: {
      phosphor: {
        component: "Upload",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Upload",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: "Upload",
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "download",
    aliases: ["get", "fetch"],
    projectSpellings: ["download"],
    providers: {
      phosphor: {
        component: "Download",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Download",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: "Download",
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "x",
    aliases: ["cancel"],
    projectSpellings: ["x"],
    providers: {
      phosphor: {
        component: "X",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "X",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "check",
    aliases: ["done", "complete", "tick"],
    projectSpellings: ["check"],
    providers: {
      phosphor: {
        component: "Check",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Check",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Check",
        requestedComponent: "Check",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "search",
    aliases: ["magnify", "lookup"],
    projectSpellings: ["search"],
    providers: {
      phosphor: {
        component: "MagnifyingGlass",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Search",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "SearchNormal",
        requestedComponent: "SearchNormal",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "share",
    aliases: ["send", "export"],
    projectSpellings: ["share"],
    providers: {
      phosphor: {
        component: "Share",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Share",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "copy",
    aliases: ["duplicate", "clone"],
    projectSpellings: ["copy"],
    providers: {
      phosphor: {
        component: "Copy",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Copy",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "save",
    aliases: ["store", "floppy"],
    projectSpellings: ["save"],
    providers: {
      phosphor: {
        component: "FloppyDisk",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Save",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "loader",
    aliases: ["spinner", "loading", "wait"],
    projectSpellings: ["loader"],
    providers: {
      phosphor: {
        component: "Spinner",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Loader2",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "loader2",
    aliases: [],
    projectSpellings: ["loader2"],
    providers: {
      phosphor: {
        component: "Spinner",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Loader2",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "success",
    aliases: ["check-circle", "checkCircle", "checkmark"],
    projectSpellings: ["check-circle", "checkCircle", "success"],
    providers: {
      phosphor: {
        component: "CheckCircle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "CheckCircle",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "TickCircle",
        requestedComponent: "TickCircle",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "error",
    aliases: ["fail", "cross", "xCircle"],
    projectSpellings: ["error"],
    providers: {
      phosphor: {
        component: "XCircle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "XCircle",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "CloseCircle",
        requestedComponent: "CloseCircle",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "warning",
    aliases: ["alert", "caution"],
    projectSpellings: ["warning"],
    providers: {
      phosphor: {
        component: "WarningCircle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "AlertCircle",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Warning2",
        requestedComponent: "Warning2",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "info",
    aliases: ["information", "help"],
    projectSpellings: ["info"],
    providers: {
      phosphor: {
        component: "Info",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Info",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "InfoCircle",
        requestedComponent: "InfoCircle",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "refresh",
    aliases: ["reload", "update", "sync"],
    projectSpellings: ["refresh"],
    providers: {
      phosphor: {
        component: "ArrowClockwise",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "RefreshCw",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Refresh",
        requestedComponent: "Refresh",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "refreshCw",
    aliases: ["refresh-cw"],
    projectSpellings: ["refreshCw"],
    providers: {
      phosphor: {
        component: "ArrowClockwise",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "RefreshCw",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Refresh",
        requestedComponent: "Refresh",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "bell",
    aliases: ["notification", "notify", "alarm"],
    projectSpellings: ["bell"],
    providers: {
      phosphor: {
        component: "Bell",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Bell",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: "Bell",
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "heart",
    aliases: ["like", "love"],
    projectSpellings: ["heart"],
    providers: {
      phosphor: {
        component: "Heart",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Heart",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Heart",
        requestedComponent: "Heart",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "star",
    aliases: ["favorite"],
    projectSpellings: ["star"],
    providers: {
      phosphor: {
        component: "Star",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Star",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Star",
        requestedComponent: "Star",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "bookmark",
    aliases: ["saveBookmark"],
    projectSpellings: ["bookmark"],
    providers: {
      phosphor: {
        component: "Bookmark",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Bookmark",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "user",
    aliases: ["person", "account", "profile"],
    projectSpellings: ["user"],
    providers: {
      phosphor: {
        component: "User",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "User",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "User",
        requestedComponent: "User",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "userPlus",
    aliases: ["user-plus", "addUser", "invite"],
    projectSpellings: ["userPlus"],
    providers: {
      phosphor: {
        component: "UserPlus",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "UserPlus",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "UserAdd",
        requestedComponent: "UserAdd",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "logIn",
    aliases: ["log-in", "signin", "login", "enter"],
    projectSpellings: ["logIn"],
    providers: {
      phosphor: {
        component: "SignIn",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "LogIn",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Login",
        requestedComponent: "Login",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "logOut",
    aliases: ["log-out", "signout", "logout", "exit"],
    projectSpellings: ["logOut"],
    providers: {
      phosphor: {
        component: "SignOut",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "LogOut",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Logout",
        requestedComponent: "Logout",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "chrome",
    aliases: [],
    projectSpellings: ["chrome"],
    providers: {
      phosphor: {
        component: "GoogleChromeLogo",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Chrome",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Chrome",
        requestedComponent: "Chrome",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "github",
    aliases: [],
    projectSpellings: ["github"],
    providers: {
      phosphor: {
        component: "GithubLogo",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Github",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "message",
    aliases: ["chat", "comment", "talk"],
    projectSpellings: ["message"],
    providers: {
      phosphor: {
        component: "ChatCircle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "MessageCircle",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "messageSquare",
    aliases: ["message-square"],
    projectSpellings: ["messageSquare", "message-square"],
    providers: {
      phosphor: {
        component: "Chat",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "MessageSquare",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "inbox",
    aliases: [],
    projectSpellings: ["inbox"],
    providers: {
      phosphor: {
        component: "Tray",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Inbox",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "calendar",
    aliases: ["date", "schedule"],
    projectSpellings: ["calendar"],
    providers: {
      phosphor: {
        component: "Calendar",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Calendar",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "calendarPlus",
    aliases: ["calendar-plus"],
    projectSpellings: ["calendarPlus"],
    providers: {
      phosphor: {
        component: "CalendarPlus",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "CalendarPlus",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "checkSquare",
    aliases: ["check-square"],
    projectSpellings: ["checkSquare"],
    providers: {
      phosphor: {
        component: "CheckSquare",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "CheckSquare",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "TickSquare",
        requestedComponent: "TickSquare",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "clock",
    aliases: ["time", "watch"],
    projectSpellings: ["clock"],
    providers: {
      phosphor: {
        component: "Clock",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Clock",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "book",
    aliases: ["read", "library"],
    projectSpellings: ["book"],
    providers: {
      phosphor: {
        component: "Book",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Book",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Book",
        requestedComponent: "Book",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "bookOpen",
    aliases: ["book-open", "reading", "openBook"],
    projectSpellings: ["bookOpen"],
    providers: {
      phosphor: {
        component: "BookOpen",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "BookOpen",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Book",
        requestedComponent: "Book",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "monitor",
    aliases: ["screen", "display"],
    projectSpellings: ["monitor"],
    providers: {
      phosphor: {
        component: "Monitor",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Monitor",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Monitor",
        requestedComponent: "Monitor",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "sun",
    aliases: ["light", "day"],
    projectSpellings: ["sun"],
    providers: {
      phosphor: {
        component: "Sun",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Sun",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Sun",
        requestedComponent: "Sun",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "moon",
    aliases: ["dark", "night"],
    projectSpellings: ["moon"],
    providers: {
      phosphor: {
        component: "Moon",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Moon",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Moon",
        requestedComponent: "Moon",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "sparkle",
    aliases: [],
    projectSpellings: ["sparkle"],
    providers: {
      phosphor: {
        component: "Sparkle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Sparkle",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "sparkles",
    aliases: ["magic", "stars", "glitter"],
    projectSpellings: ["sparkles"],
    providers: {
      phosphor: {
        component: "Sparkle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Sparkles",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "lightbulb",
    aliases: ["idea", "bulb", "inspiration"],
    projectSpellings: ["lightbulb"],
    providers: {
      phosphor: {
        component: "Lightbulb",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Lightbulb",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "brain",
    aliases: ["ai", "intelligence", "think"],
    projectSpellings: ["brain"],
    providers: {
      phosphor: {
        component: "Brain",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Brain",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "zap",
    aliases: ["lightning", "bolt", "flash"],
    projectSpellings: ["zap"],
    providers: {
      phosphor: {
        component: "Lightning",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Zap",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "globe",
    aliases: [],
    projectSpellings: ["globe"],
    providers: {
      phosphor: {
        component: "Globe",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Globe",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Global",
        requestedComponent: "Global",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "deviceMobile",
    aliases: ["device-mobile"],
    projectSpellings: ["deviceMobile"],
    providers: {
      phosphor: {
        component: "DeviceMobile",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Smartphone",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "smartphone",
    aliases: [],
    projectSpellings: ["smartphone"],
    providers: {
      phosphor: {
        component: "DeviceMobile",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Smartphone",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "floppyDisk",
    aliases: ["floppy-disk"],
    projectSpellings: ["floppyDisk"],
    providers: {
      phosphor: {
        component: "FloppyDisk",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Save",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "chart",
    aliases: [],
    projectSpellings: ["chart"],
    providers: {
      phosphor: {
        component: "ChartBar",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "BarChart3",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "barChart",
    aliases: ["bar-chart", "graph", "stats", "analytics"],
    projectSpellings: ["barChart"],
    providers: {
      phosphor: {
        component: "ChartBar",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "BarChart",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "trendingUp",
    aliases: ["trending-up", "up"],
    projectSpellings: ["trendingUp"],
    providers: {
      phosphor: {
        component: "TrendUp",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "TrendingUp",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "trendingDown",
    aliases: ["trending-down", "down"],
    projectSpellings: ["trendingDown"],
    providers: {
      phosphor: {
        component: "TrendDown",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "TrendingDown",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "activity",
    aliases: ["pulse"],
    projectSpellings: ["activity"],
    providers: {
      phosphor: {
        component: "Pulse",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Activity",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "database",
    aliases: ["db", "storage"],
    projectSpellings: ["database"],
    providers: {
      phosphor: {
        component: "Database",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Database",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "dollarSign",
    aliases: ["dollar-sign"],
    projectSpellings: ["dollarSign"],
    providers: {
      phosphor: {
        component: "CurrencyDollar",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "DollarSign",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "dollar",
    aliases: [],
    projectSpellings: ["dollar"],
    providers: {
      phosphor: {
        component: "CurrencyDollar",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "DollarSign",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "currency",
    aliases: [],
    projectSpellings: ["currency"],
    providers: {
      phosphor: {
        component: "CurrencyDollar",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "DollarSign",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "layers",
    aliases: [],
    projectSpellings: ["layers"],
    providers: {
      phosphor: {
        component: "Stack",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Layers",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "ban",
    aliases: [],
    projectSpellings: ["ban"],
    providers: {
      phosphor: {
        component: "Prohibit",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Ban",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "lock",
    aliases: ["secure", "locked"],
    projectSpellings: ["lock"],
    providers: {
      phosphor: {
        component: "Lock",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Lock",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Lock",
        requestedComponent: "Lock",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "unlock",
    aliases: ["unsecure", "unlocked"],
    projectSpellings: ["unlock"],
    providers: {
      phosphor: {
        component: "LockOpen",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Unlock",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Unlock",
        requestedComponent: "Unlock",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "shield",
    aliases: ["security", "protect"],
    projectSpellings: ["shield"],
    providers: {
      phosphor: {
        component: "Shield",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Shield",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Shield",
        requestedComponent: "Shield",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "key",
    aliases: ["password", "secret"],
    projectSpellings: ["key"],
    providers: {
      phosphor: {
        component: "Key",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Key",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "play",
    aliases: ["start", "run"],
    projectSpellings: ["play"],
    providers: {
      phosphor: {
        component: "Play",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Play",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Play",
        requestedComponent: "Play",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "pause",
    aliases: ["stop", "halt"],
    projectSpellings: ["pause"],
    providers: {
      phosphor: {
        component: "Pause",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Pause",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Pause",
        requestedComponent: "Pause",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "image",
    aliases: ["picture", "img"],
    projectSpellings: ["image"],
    providers: {
      phosphor: {
        component: "Image",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Image",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Image",
        requestedComponent: "Image",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "video",
    aliases: ["movie", "film"],
    projectSpellings: ["video"],
    providers: {
      phosphor: {
        component: "Video",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Video",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Video",
        requestedComponent: "Video",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "camera",
    aliases: ["photo", "capture"],
    projectSpellings: ["camera"],
    providers: {
      phosphor: {
        component: "Camera",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Camera",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Camera",
        requestedComponent: "Camera",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "fileText",
    aliases: ["file-text", "document", "doc", "text"],
    projectSpellings: ["fileText"],
    providers: {
      phosphor: {
        component: "FileText",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "FileText",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "file",
    aliases: [],
    projectSpellings: ["file"],
    providers: {
      phosphor: {
        component: "File",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "File",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "externalLink",
    aliases: ["external-link", "external", "outbound", "open"],
    projectSpellings: ["externalLink"],
    providers: {
      phosphor: {
        component: "ArrowSquareOut",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ExternalLink",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "link",
    aliases: ["url", "hyperlink"],
    projectSpellings: ["link"],
    providers: {
      phosphor: {
        component: "Link",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Link",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Link",
        requestedComponent: "Link",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "moreHorizontal",
    aliases: ["more-horizontal", "dots", "moreMenu"],
    projectSpellings: ["moreHorizontal"],
    providers: {
      phosphor: {
        component: "DotsThreeOutline",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "MoreHorizontal",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "moreVertical",
    aliases: ["more-vertical", "moreOptions"],
    projectSpellings: ["moreVertical"],
    providers: {
      phosphor: {
        component: "DotsThreeVertical",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "MoreVertical",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "remove",
    aliases: [],
    projectSpellings: ["remove"],
    providers: {
      phosphor: {
        component: "Minus",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Minus",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Minus",
        requestedComponent: "Minus",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "eye",
    aliases: ["show", "view"],
    projectSpellings: ["eye"],
    providers: {
      phosphor: {
        component: "Eye",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Eye",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Eye",
        requestedComponent: "Eye",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "eyeOff",
    aliases: ["eye-off", "hide", "hidden"],
    projectSpellings: ["eyeOff"],
    providers: {
      phosphor: {
        component: "EyeSlash",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "EyeOff",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "EyeSlash",
        requestedComponent: "EyeSlash",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "smile",
    aliases: [],
    projectSpellings: ["smile"],
    providers: {
      phosphor: {
        component: "Smiley",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Smile",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "EmojiHappy",
        requestedComponent: "EmojiHappy",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "frown",
    aliases: [],
    projectSpellings: ["frown"],
    providers: {
      phosphor: {
        component: "SmileySad",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Frown",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "EmojiSad",
        requestedComponent: "EmojiSad",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "meh",
    aliases: [],
    projectSpellings: ["meh"],
    providers: {
      phosphor: {
        component: "SmileyMeh",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Meh",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "EmojiNormal",
        requestedComponent: "EmojiNormal",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "mail",
    aliases: ["email", "envelope"],
    projectSpellings: ["mail"],
    providers: {
      phosphor: {
        component: "Envelope",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Mail",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "phone",
    aliases: [],
    projectSpellings: ["phone"],
    providers: {
      phosphor: {
        component: "Phone",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Phone",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "flag",
    aliases: [],
    projectSpellings: ["flag"],
    providers: {
      phosphor: {
        component: "Flag",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Flag",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Flag",
        requestedComponent: "Flag",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "rocket",
    aliases: [],
    projectSpellings: ["rocket"],
    providers: {
      phosphor: {
        component: "Rocket",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Rocket",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: "Rocket",
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "ticket",
    aliases: [],
    projectSpellings: ["ticket"],
    providers: {
      phosphor: {
        component: "Ticket",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Ticket",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Ticket",
        requestedComponent: "Ticket",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "clipboard",
    aliases: [],
    projectSpellings: ["clipboard"],
    providers: {
      phosphor: {
        component: "Clipboard",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ClipboardList",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Sticker",
        requestedComponent: "Sticker",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "wifi",
    aliases: [],
    projectSpellings: ["wifi"],
    providers: {
      phosphor: {
        component: "WifiHigh",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Wifi",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Wifi",
        requestedComponent: "Wifi",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "wifiOff",
    aliases: [],
    projectSpellings: ["wifiOff"],
    providers: {
      phosphor: {
        component: "WifiSlash",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "WifiOff",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "cpu",
    aliases: [],
    projectSpellings: ["cpu"],
    providers: {
      phosphor: {
        component: "Cpu",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Cpu",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Computing",
        requestedComponent: "Computing",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "mask",
    aliases: [],
    projectSpellings: ["mask"],
    providers: {
      phosphor: {
        component: "MaskHappy",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Drama",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "EmojiHappy",
        requestedComponent: "EmojiHappy",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "bold",
    aliases: [],
    projectSpellings: ["bold"],
    providers: {
      phosphor: {
        component: "TextB",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Bold",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "italic",
    aliases: [],
    projectSpellings: ["italic"],
    providers: {
      phosphor: {
        component: "TextItalic",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Italic",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "strikethrough",
    aliases: [],
    projectSpellings: ["strikethrough"],
    providers: {
      phosphor: {
        component: "TextStrikethrough",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Strikethrough",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "heading",
    aliases: [],
    projectSpellings: ["heading"],
    providers: {
      phosphor: {
        component: "TextHOne",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Heading",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "code",
    aliases: [],
    projectSpellings: ["code"],
    providers: {
      phosphor: {
        component: "Code",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Code",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Code",
        requestedComponent: "Code",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "fileCode",
    aliases: [],
    projectSpellings: ["fileCode"],
    providers: {
      phosphor: {
        component: "FileCode",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "FileCode",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "quote",
    aliases: [],
    projectSpellings: ["quote"],
    providers: {
      phosphor: {
        component: "Quotes",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Quote",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "QuoteUp",
        requestedComponent: "QuoteUp",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "list",
    aliases: [],
    projectSpellings: ["list"],
    providers: {
      phosphor: {
        component: "List",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "List",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "listOrdered",
    aliases: [],
    projectSpellings: ["listOrdered"],
    providers: {
      phosphor: {
        component: "ListNumbers",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "ListOrdered",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "minus",
    aliases: [],
    projectSpellings: ["minus"],
    providers: {
      phosphor: {
        component: "Minus",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Minus",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "Minus",
        requestedComponent: "Minus",
        tier: "essential",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "circle",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "Circle",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "helpCircle",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "Question",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "wallet",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "Wallet",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "square",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "Square",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "layout",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "Layout",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "megaphone",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "Megaphone",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
      iconsax: {
        component: null,
        requestedComponent: null,
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "mapPin",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "MapPin",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "MapPin",
        requestedComponent: "MapPin",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: null,
        requestedComponent: "Location",
        tier: "unsupported",
        capabilities: [],
      },
    },
  },
  {
    id: "alignLeft",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "TextAlignLeft",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "AlignLeft",
        requestedComponent: "AlignLeft",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "TextalignLeft",
        requestedComponent: "TextalignLeft",
        tier: "full",
        capabilities: ["line", "bold"],
      },
    },
  },
  {
    id: "underline",
    aliases: [],
    projectSpellings: [],
    providers: {
      phosphor: {
        component: "TextUnderline",
        tier: "default",
        capabilities: ["weights"],
      },
      lucide: {
        component: "Underline",
        requestedComponent: "Underline",
        tier: "optional",
        capabilities: ["line"],
      },
      iconsax: {
        component: "TextUnderline",
        requestedComponent: "TextUnderline",
        tier: "full",
        capabilities: ["line", "bold"],
      },
    },
  },
] as const;

export const ICON_CATALOG: readonly IconCatalogRecord[] = defineIconCatalog(
  ICON_CATALOG_DEFINITION,
);

export type IconCatalogEntry = IconCatalogRecord;
// Generated declaration projection from ICON_CATALOG_DEFINITION. The focused
// catalog test rejects any value drift while keeping DTS inference bounded.
/* icon-catalog-id:generated:start */
export type IconCatalogId =
  | "home"
  | "layoutDashboard"
  | "folder"
  | "alertCircle"
  | "columns"
  | "users"
  | "settings"
  | "menu"
  | "close"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "chevronUp"
  | "arrowLeft"
  | "arrowRight"
  | "arrowUp"
  | "arrowDown"
  | "add"
  | "edit"
  | "pencil"
  | "delete"
  | "upload"
  | "download"
  | "x"
  | "check"
  | "search"
  | "share"
  | "copy"
  | "save"
  | "loader"
  | "loader2"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "refresh"
  | "refreshCw"
  | "bell"
  | "heart"
  | "star"
  | "bookmark"
  | "user"
  | "userPlus"
  | "logIn"
  | "logOut"
  | "chrome"
  | "github"
  | "message"
  | "messageSquare"
  | "inbox"
  | "calendar"
  | "calendarPlus"
  | "checkSquare"
  | "clock"
  | "book"
  | "bookOpen"
  | "monitor"
  | "sun"
  | "moon"
  | "sparkle"
  | "sparkles"
  | "lightbulb"
  | "brain"
  | "zap"
  | "globe"
  | "deviceMobile"
  | "smartphone"
  | "floppyDisk"
  | "chart"
  | "barChart"
  | "trendingUp"
  | "trendingDown"
  | "activity"
  | "database"
  | "dollarSign"
  | "dollar"
  | "currency"
  | "layers"
  | "ban"
  | "lock"
  | "unlock"
  | "shield"
  | "key"
  | "play"
  | "pause"
  | "image"
  | "video"
  | "camera"
  | "fileText"
  | "file"
  | "externalLink"
  | "link"
  | "moreHorizontal"
  | "moreVertical"
  | "remove"
  | "eye"
  | "eyeOff"
  | "smile"
  | "frown"
  | "meh"
  | "mail"
  | "phone"
  | "flag"
  | "rocket"
  | "ticket"
  | "clipboard"
  | "wifi"
  | "wifiOff"
  | "cpu"
  | "mask"
  | "bold"
  | "italic"
  | "strikethrough"
  | "heading"
  | "code"
  | "fileCode"
  | "quote"
  | "list"
  | "listOrdered"
  | "minus"
  | "circle"
  | "helpCircle"
  | "wallet"
  | "square"
  | "layout"
  | "megaphone"
  | "mapPin"
  | "alignLeft"
  | "underline";
/* icon-catalog-id:generated:end */
/* icon-catalog-alias:generated:start */
export type IconCatalogAlias =
  | "house"
  | "main"
  | "layout-dashboard"
  | "directory"
  | "dir"
  | "alert-circle"
  | "people"
  | "group"
  | "team"
  | "gear"
  | "config"
  | "preferences"
  | "prefs"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "arrow-left"
  | "back"
  | "prev"
  | "previous"
  | "arrow-right"
  | "forward"
  | "next"
  | "arrow-up"
  | "arrow-down"
  | "plus"
  | "new"
  | "modify"
  | "trash"
  | "post"
  | "get"
  | "fetch"
  | "cancel"
  | "done"
  | "complete"
  | "tick"
  | "magnify"
  | "lookup"
  | "send"
  | "export"
  | "duplicate"
  | "clone"
  | "store"
  | "floppy"
  | "spinner"
  | "loading"
  | "wait"
  | "check-circle"
  | "checkCircle"
  | "checkmark"
  | "fail"
  | "cross"
  | "xCircle"
  | "alert"
  | "caution"
  | "information"
  | "help"
  | "reload"
  | "update"
  | "sync"
  | "refresh-cw"
  | "notification"
  | "notify"
  | "alarm"
  | "like"
  | "love"
  | "favorite"
  | "saveBookmark"
  | "person"
  | "account"
  | "profile"
  | "user-plus"
  | "addUser"
  | "invite"
  | "log-in"
  | "signin"
  | "login"
  | "enter"
  | "log-out"
  | "signout"
  | "logout"
  | "exit"
  | "chat"
  | "comment"
  | "talk"
  | "message-square"
  | "date"
  | "schedule"
  | "calendar-plus"
  | "check-square"
  | "time"
  | "watch"
  | "read"
  | "library"
  | "book-open"
  | "reading"
  | "openBook"
  | "screen"
  | "display"
  | "light"
  | "day"
  | "dark"
  | "night"
  | "magic"
  | "stars"
  | "glitter"
  | "idea"
  | "bulb"
  | "inspiration"
  | "ai"
  | "intelligence"
  | "think"
  | "lightning"
  | "bolt"
  | "flash"
  | "device-mobile"
  | "floppy-disk"
  | "bar-chart"
  | "graph"
  | "stats"
  | "analytics"
  | "trending-up"
  | "up"
  | "trending-down"
  | "down"
  | "pulse"
  | "db"
  | "storage"
  | "dollar-sign"
  | "secure"
  | "locked"
  | "unsecure"
  | "unlocked"
  | "security"
  | "protect"
  | "password"
  | "secret"
  | "start"
  | "run"
  | "stop"
  | "halt"
  | "picture"
  | "img"
  | "movie"
  | "film"
  | "photo"
  | "capture"
  | "file-text"
  | "document"
  | "doc"
  | "text"
  | "external-link"
  | "external"
  | "outbound"
  | "open"
  | "url"
  | "hyperlink"
  | "more-horizontal"
  | "dots"
  | "moreMenu"
  | "more-vertical"
  | "moreOptions"
  | "show"
  | "view"
  | "eye-off"
  | "hide"
  | "hidden"
  | "email"
  | "envelope";
/* icon-catalog-alias:generated:end */
export type IconCatalogName = IconCatalogId | IconCatalogAlias;
/* icon-catalog-legacy:generated:start */
export type LegacyProjectIconName =
  | "home"
  | "layout-dashboard"
  | "folder"
  | "alert-circle"
  | "alertCircle"
  | "columns"
  | "users"
  | "settings"
  | "menu"
  | "close"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "chevronUp"
  | "arrowLeft"
  | "arrowRight"
  | "arrowUp"
  | "arrowDown"
  | "add"
  | "edit"
  | "pencil"
  | "delete"
  | "trash"
  | "upload"
  | "download"
  | "x"
  | "check"
  | "search"
  | "share"
  | "copy"
  | "save"
  | "loader"
  | "loader2"
  | "check-circle"
  | "checkCircle"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "refresh"
  | "refreshCw"
  | "bell"
  | "heart"
  | "star"
  | "bookmark"
  | "user"
  | "userPlus"
  | "logIn"
  | "logOut"
  | "chrome"
  | "github"
  | "message"
  | "messageSquare"
  | "message-square"
  | "inbox"
  | "calendar"
  | "calendarPlus"
  | "checkSquare"
  | "clock"
  | "book"
  | "bookOpen"
  | "monitor"
  | "sun"
  | "moon"
  | "sparkle"
  | "sparkles"
  | "lightbulb"
  | "brain"
  | "zap"
  | "globe"
  | "deviceMobile"
  | "smartphone"
  | "floppyDisk"
  | "chart"
  | "barChart"
  | "trendingUp"
  | "trendingDown"
  | "activity"
  | "database"
  | "dollarSign"
  | "dollar"
  | "currency"
  | "layers"
  | "ban"
  | "lock"
  | "unlock"
  | "shield"
  | "key"
  | "play"
  | "pause"
  | "image"
  | "video"
  | "camera"
  | "fileText"
  | "file"
  | "externalLink"
  | "link"
  | "moreHorizontal"
  | "moreVertical"
  | "remove"
  | "eye"
  | "eyeOff"
  | "smile"
  | "frown"
  | "meh"
  | "mail"
  | "phone"
  | "flag"
  | "rocket"
  | "ticket"
  | "clipboard"
  | "wifi"
  | "wifiOff"
  | "cpu"
  | "mask"
  | "bold"
  | "italic"
  | "strikethrough"
  | "heading"
  | "code"
  | "fileCode"
  | "quote"
  | "list"
  | "listOrdered"
  | "minus";
/* icon-catalog-legacy:generated:end */

export const ICON_CATALOG_IDS = Object.freeze(
  ICON_CATALOG.map((record) => record.id),
) as readonly IconCatalogId[];

export const LEGACY_PROJECT_ICON_NAMES = Object.freeze(
  ICON_CATALOG.flatMap((record) => record.projectSpellings),
) as readonly LegacyProjectIconName[];

function createFrozenLookup<Key extends string, Value>(
  entries: ReadonlyArray<readonly [Key, Value]>,
): Readonly<Record<Key, Value>> {
  const lookup = Object.create(null) as Record<Key, Value>;
  for (const [key, value] of entries) lookup[key] = value;
  return Object.freeze(lookup);
}

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export const ICON_ALIAS_MAP = createFrozenLookup<
  IconCatalogAlias,
  IconCatalogId
>(
  ICON_CATALOG.flatMap((record) =>
    record.aliases.map(
      (alias) =>
        [alias as IconCatalogAlias, record.id as IconCatalogId] as const,
    ),
  ),
);

export const ICON_CATALOG_BY_ID = createFrozenLookup<
  IconCatalogId,
  IconCatalogEntry
>(ICON_CATALOG.map((record) => [record.id as IconCatalogId, record] as const));

export const ICON_NAMES = Object.freeze([
  ...ICON_CATALOG_IDS,
  ...Object.keys(ICON_ALIAS_MAP),
]) as readonly IconCatalogName[];

export function resolveIconCatalogName(name: string): IconCatalogId | null {
  if (typeof name !== "string" || name.length === 0) return null;
  if (hasOwn(ICON_CATALOG_BY_ID, name)) return name as IconCatalogId;
  if (hasOwn(ICON_ALIAS_MAP, name))
    return ICON_ALIAS_MAP[name as IconCatalogAlias];
  const camelCased = toCamelCase(name);
  if (hasOwn(ICON_CATALOG_BY_ID, camelCased))
    return camelCased as IconCatalogId;
  return hasOwn(ICON_ALIAS_MAP, camelCased)
    ? ICON_ALIAS_MAP[camelCased as IconCatalogAlias]
    : null;
}

export function getIconCatalogEntry(name: string): IconCatalogEntry | null {
  const id = resolveIconCatalogName(name);
  return id === null || !hasOwn(ICON_CATALOG_BY_ID, id)
    ? null
    : ICON_CATALOG_BY_ID[id];
}

export function getIconProviderBinding(
  name: string,
  provider: IconProviderName,
): IconProviderBinding | null {
  return getIconCatalogEntry(name)?.providers[provider] ?? null;
}

export function getIconProviderComponent(
  name: string,
  provider: IconProviderName,
): string | null {
  return getIconProviderBinding(name, provider)?.component ?? null;
}
