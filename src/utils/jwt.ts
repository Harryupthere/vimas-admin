import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}

/** True if the token is missing, malformed, or past its `exp` claim. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return false; // no exp claim — treat as non-expiring
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
