// Avoid static import of `jsonwebtoken` so the project can build even when the
// package hasn't been installed yet. We attempt a dynamic import and, if it
// fails, provide a lightweight development fallback.

export function verifyAdmin(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  if (!adminUser || !adminPass) return false;
  // For now we compare plain-text; recommend hashing in production.
  return username === adminUser && password === adminPass;
}

export async function createToken(
  payload: Record<string, unknown>
): Promise<string> {
  const secret = process.env.JWT_SECRET || "dev-secret";
  try {
    // dynamic import — if `jsonwebtoken` isn't installed this will throw
    // @ts-expect-error: optional dependency may not be installed in dev
    const jwt = await import("jsonwebtoken");
    // jwt.sign may be a default or named export depending on environment
    const sign = (jwt && (jwt.default ?? jwt).sign) as (
      payload: Record<string, unknown>,
      secretOrPrivateKey: string,
      options?: Record<string, unknown>
    ) => string;
    return sign(payload, secret, { expiresIn: "7d" });
  } catch {
    // Fallback: return a simple dev token. NOT SECURE. Install `jsonwebtoken`
    // and restart the dev server to use real JWTs.
    // Include username in token if available for minimal dev usage.
    const uname =
      ((payload as Record<string, unknown>)["username"] as string) ?? "dev";
    return `dev-token:${String(uname)}`;
  }
}

export async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  const secret = process.env.JWT_SECRET || "dev-secret";
  try {
    // @ts-expect-error: optional dependency may not be installed in dev
    const jwt = await import("jsonwebtoken");
    const verify = (jwt && (jwt.default ?? jwt).verify) as (
      token: string,
      secretOrPublicKey: string
    ) => Record<string, unknown>;
    return verify(token, secret) as Record<string, unknown>;
  } catch {
    // Fallback: accept `dev-token:<username>` format
    if (token?.startsWith("dev-token:")) {
      const username = token.split(":", 2)[1] ?? "dev";
      return { username };
    }
    return null;
  }
}
