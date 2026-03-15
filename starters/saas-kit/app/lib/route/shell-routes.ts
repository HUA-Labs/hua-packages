/**
 * Clean-shell route detection.
 *
 * Routes listed here bypass app-level chrome (Header, Footer,
 * BottomNavigation, AppShell padding). They provide their own
 * full-page shell instead (e.g. AdminShell).
 *
 * Add new prefixes here when a route needs a clean shell —
 * all 5 layout components read from this single source.
 */

const CLEAN_SHELL_PREFIXES = ["/admin"] as const;

/** Returns true if `pathname` should skip the app-level shell chrome. */
export function isCleanShellRoute(
  pathname: string | null | undefined,
): boolean {
  if (!pathname) return false;
  return CLEAN_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
