/**
 * Icon name normalization backed by the semantic icon catalog.
 */

import {
  ICON_ALIAS_MAP,
  ICON_CATALOG_BY_ID,
  getIconProviderComponent,
  type IconCatalogAlias,
  type IconProviderName,
} from "./icon-catalog";
import { toCamelCase } from "./case-utils";

export { toCamelCase, toPascalCase } from "./case-utils";

export type IconProviderType = IconProviderName;

export interface NormalizeResult {
  normalized: string;
  wasAlias: boolean;
  originalAlias?: string;
}

export function normalizeIconName(iconName: string): NormalizeResult {
  if (!iconName || typeof iconName !== "string") {
    return { normalized: iconName || "", wasAlias: false };
  }

  if (Object.prototype.hasOwnProperty.call(ICON_CATALOG_BY_ID, iconName)) {
    return { normalized: iconName, wasAlias: false };
  }
  const exactAlias = Object.prototype.hasOwnProperty.call(
    ICON_ALIAS_MAP,
    iconName,
  )
    ? ICON_ALIAS_MAP[iconName as IconCatalogAlias]
    : undefined;
  if (exactAlias) {
    return {
      normalized: exactAlias,
      wasAlias: true,
      originalAlias: iconName,
    };
  }

  const camelCased = toCamelCase(iconName);
  if (Object.prototype.hasOwnProperty.call(ICON_CATALOG_BY_ID, camelCased)) {
    return { normalized: camelCased, wasAlias: false };
  }
  const camelAlias = Object.prototype.hasOwnProperty.call(
    ICON_ALIAS_MAP,
    camelCased,
  )
    ? ICON_ALIAS_MAP[camelCased as IconCatalogAlias]
    : undefined;
  if (camelAlias) {
    return {
      normalized: camelAlias,
      wasAlias: true,
      originalAlias: iconName,
    };
  }

  return { normalized: camelCased, wasAlias: false };
}

/**
 * Return an exact provider component from the catalog.
 *
 * Unknown or explicitly unsupported names return null. Provider component
 * names are never inferred with PascalCase.
 */
export function getProviderIconName(
  iconName: string,
  provider: IconProviderType,
): string | null {
  return getIconProviderComponent(iconName, provider);
}
