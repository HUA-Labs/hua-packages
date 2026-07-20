/**
 * Icon aliases derived from the semantic icon catalog.
 *
 * Canonical names are never shadowed by aliases. All alias targets are direct
 * catalog IDs, so runtime resolution cannot traverse a cycle.
 */

import {
  ICON_ALIAS_MAP,
  ICON_CATALOG_BY_ID,
  type IconCatalogAlias,
  type IconCatalogId,
} from "./icon-catalog";

export const ICON_ALIASES: Readonly<Record<IconCatalogAlias, IconCatalogId>> =
  ICON_ALIAS_MAP;

export function resolveIconAlias(iconName: string): string {
  if (typeof iconName !== "string") {
    throw new TypeError("iconName must be a string");
  }
  if (ICON_CATALOG_BY_ID[iconName as IconCatalogId]) return iconName;
  return ICON_ALIASES[iconName as IconCatalogAlias] ?? iconName;
}

export function getIconAliases(iconName: string): string[] {
  if (typeof iconName !== "string") {
    throw new TypeError("iconName must be a string");
  }
  if (!ICON_CATALOG_BY_ID[iconName as IconCatalogId]) return [];
  return Object.entries(ICON_ALIASES)
    .filter(([, target]) => target === iconName)
    .map(([alias]) => alias);
}
