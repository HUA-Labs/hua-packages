/**
 * Joins already-authoritative Web className segments without interpreting them.
 *
 * This intentionally does not parse Dot, trim caller bytes, deduplicate tokens,
 * or resolve utility-class conflicts. It is private composition plumbing for
 * component-owned, classDot-generated, raw caller, and Slot child classes.
 */
export function joinWebClassNames(
  ...segments: readonly (string | undefined)[]
): string | undefined {
  const present: string[] = [];

  for (const segment of segments) {
    if (segment === undefined || segment === "") continue;
    if (typeof segment !== "string") {
      throw new TypeError("web-classname-segment-invalid");
    }
    present.push(segment);
  }

  return present.length > 0 ? present.join(" ") : undefined;
}
