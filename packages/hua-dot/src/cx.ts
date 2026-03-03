/**
 * dotCx — clsx replacement for the dot ecosystem.
 *
 * Filters falsy values and joins dot utility strings into a single string.
 * Use with dot() to get merged styles.
 *
 * @example
 * dotCx('p-4', isActive && 'bg-primary', undefined, className)
 * // → 'p-4 bg-primary some-class' (falsy values removed)
 *
 * dotCx('p-4', false, null, '', 'flex')
 * // → 'p-4 flex'
 */
export function dotCx(
  ...inputs: (string | false | null | undefined | 0 | '')[]
): string {
  let result = '';
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (input && typeof input === 'string') {
      if (result) result += ' ';
      result += input;
    }
  }
  return result;
}
