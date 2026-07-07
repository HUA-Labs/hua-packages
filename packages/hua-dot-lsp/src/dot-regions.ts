/** Patterns to find dot('...') / dot="..." / dot={`...`} regions.
 *  Each quote type has its own pattern to allow nested quotes of other types
 *  (e.g., dot("font-['Inter']") should capture the full string). */
const DOT_STRING_PATTERNS: RegExp[] = [
  /dot\s*\(\s*"([^"]*)"/g, // dot("...")
  /dot\s*\(\s*'([^']*)'/g, // dot('...')
  /dot\s*\(\s*`([^`]*)`/g, // dot(`...`)
  /dot\s*=\s*"([^"]*)"/g, // dot="..."
  /dot\s*=\s*'([^']*)'/g, // dot='...'
  /dot\s*=\s*\{"([^"]*)"\}/g, // dot={"..."}
  /dot\s*=\s*\{'([^']*)'\}/g, // dot={'...'}
  /dot\s*=\s*\{`([^`]*)`\}/g, // dot={`...`}
];

export interface DotRegion {
  /** The utility string content */
  content: string;
  /** Start offset of content (not including quote) in the document */
  contentStart: number;
  /** End offset of content */
  contentEnd: number;
}

export function findDotRegions(text: string): DotRegion[] {
  const regions: DotRegion[] = [];
  for (const pattern of DOT_STRING_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const full = match[0];
      const content = match[1];
      // Find the actual content start (after the opening quote)
      const quoteIdx = full.indexOf(content);
      const contentStart = match.index + quoteIdx;
      regions.push({
        content,
        contentStart,
        contentEnd: contentStart + content.length,
      });
    }
  }
  return regions;
}
