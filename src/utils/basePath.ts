// Vite's `base` config wants a trailing slash (see vite.config.ts and
// index.html's %BASE_URL% substitution), but react-router's `basename`
// must NOT have one — so every consumer here goes through this
// normalized, slash-free value instead of reading the env var directly.
function normalizedBasePath(): string {
  return (import.meta.env.VITE_BASE_PATH || '').replace(/\/+$/, '');
}

/**
 * The value to hand to <BrowserRouter basename>.
 *
 *   getBasePath()  ->  '/admin'  (VITE_BASE_PATH=/admin/)
 *   getBasePath()  ->  '/'       (VITE_BASE_PATH unset)
 */
export function getBasePath(): string {
  return normalizedBasePath() || '/';
}

/**
 * Prefixes an app-relative path with VITE_BASE_PATH (see vite.config.ts).
 *
 * react-router's <BrowserRouter basename> already does this for in-app
 * navigation (`<Navigate>`, `useNavigate`, etc.) — this helper is only for
 * the handful of places that redirect via a bare `window.location.href`
 * outside the router context (e.g. a hard logout), which would otherwise
 * bypass the configured base path entirely.
 *
 *   withBasePath('/login')  ->  '/admin/login'  (VITE_BASE_PATH=/admin/)
 *   withBasePath('/login')  ->  '/login'        (VITE_BASE_PATH unset)
 */
export function withBasePath(path: string): string {
  return `${normalizedBasePath()}${path}`;
}
