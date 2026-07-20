/**
 * Public icon-name compatibility projections derived from icon-catalog.ts.
 */

import {
  ICON_NAMES,
  getIconProviderComponent,
  type IconCatalogName,
  type IconProviderName,
  type LegacyProjectIconName,
} from "./icon-catalog";
import {
  PROJECT_ICONS,
  type ProjectIconProviderMapping,
} from "./icon-providers";

export type ProjectIconName = LegacyProjectIconName;
export type AllIconName = IconCatalogName;

export const iconNames = ICON_NAMES;
const iconNameSet = new Set<string>(ICON_NAMES);

export const iconProviderMapping: Readonly<
  Record<ProjectIconName, ProjectIconProviderMapping>
> = PROJECT_ICONS;

export function isValidIconName(name: string): name is AllIconName {
  return iconNameSet.has(name);
}

export function getIconNameForProvider(
  iconName: string,
  provider: IconProviderName,
): string | null {
  return getIconProviderComponent(iconName, provider);
}
