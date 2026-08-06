/**
 * Builds a URL from a template containing `:param` segments plus a query
 * string from any leftover keys.
 *
 *   buildUrl('/admin/user/:id', { id: 5 })              -> '/admin/user/5'
 *   buildUrl('/admin/users', { page: 1, search: 'ab' })  -> '/admin/users?page=1&search=ab'
 */
export function buildUrl(template: string, params: Record<string, unknown> = {}): string {
  const used = new Set<string>();
  let url = template.replace(/:([a-zA-Z_]+)/g, (_, key: string) => {
    used.add(key);
    const value = params[key];
    return value === undefined || value === null ? '' : String(value);
  });

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (used.has(key)) continue;
    if (value === undefined || value === null || value === '') continue;
    query.append(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
}
