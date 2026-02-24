/**
 * Levenshtein distance — single-row DP optimization.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure a is the shorter string for single-row optimization
  if (a.length > b.length) [a, b] = [b, a];

  const aLen = a.length;
  const bLen = b.length;
  const row = new Array<number>(aLen + 1);

  for (let i = 0; i <= aLen; i++) row[i] = i;

  for (let j = 1; j <= bLen; j++) {
    let prev = row[0];
    row[0] = j;
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const tmp = row[i];
      row[i] = Math.min(row[i] + 1, row[i - 1] + 1, prev + cost);
      prev = tmp;
    }
  }

  return row[aLen];
}

/**
 * Find closest keys by Levenshtein distance.
 * Pre-filters by length difference for performance.
 */
export function findClosestKeys(
  target: string,
  candidates: Iterable<string>,
  maxDistance = 3,
  maxResults = 3,
): { key: string; distance: number }[] {
  const results: { key: string; distance: number }[] = [];
  const targetLen = target.length;

  for (const candidate of candidates) {
    // Length-diff pre-filter
    if (Math.abs(candidate.length - targetLen) > maxDistance) continue;

    const distance = levenshtein(target, candidate);
    if (distance > 0 && distance <= maxDistance) {
      results.push({ key: candidate, distance });
    }
  }

  return results.sort((a, b) => a.distance - b.distance).slice(0, maxResults);
}
