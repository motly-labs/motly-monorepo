/**
 * Whether an Instance or a Timeline moves: `'user'` follows the viewer's `prefers-reduced-motion`,
 * `'always'` shows the still Resting frame whatever it says, `'never'` moves whatever it says.
 * Reach for `'always'` or `'never'` to force either in a demo or a test (ADR-0012).
 */
export type ReducedMotion = 'user' | 'always' | 'never';

/**
 * Whether `setting` calls for the Resting frame now. `'user'` reads `matchMedia` from `globalThis`
 * on each call, never at import, and where there is none, as on a server, the preference is unset.
 */
export function isMotionReduced(setting: ReducedMotion): boolean {
  if (setting !== 'user') return setting === 'always';
  const host = globalThis as { matchMedia?: (query: string) => { matches: boolean } };
  return host.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
