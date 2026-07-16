export interface AuthIdentity {
  username: string;
  accountId: string;
  tokenVersion: number;
}

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

export function parseAuthIdentity(value: unknown): AuthIdentity | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const payload = value as Record<string, unknown>;
  if (
    typeof payload.username !== "string" ||
    payload.username.length < 1 ||
    payload.username.length > 50 ||
    typeof payload.accountId !== "string" ||
    !OBJECT_ID_PATTERN.test(payload.accountId) ||
    typeof payload.tokenVersion !== "number" ||
    !Number.isInteger(payload.tokenVersion) ||
    payload.tokenVersion < 0
  ) {
    return null;
  }

  return {
    username: payload.username,
    accountId: payload.accountId,
    tokenVersion: payload.tokenVersion,
  };
}

export function authIdentityMatchesUser(
  identity: AuthIdentity,
  user: { _id?: unknown; tokenVersion?: unknown } | null,
): boolean {
  if (!user || String(user._id) !== identity.accountId) return false;
  const currentTokenVersion = Number.isInteger(user.tokenVersion)
    ? user.tokenVersion
    : 0;
  return currentTokenVersion === identity.tokenVersion;
}
