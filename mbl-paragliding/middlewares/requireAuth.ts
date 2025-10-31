// middlewares/requireAuth.ts
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export type AuthUser = {
  username: string;
  iat?: number;
  exp?: number;
};

/**
 * Require JWT auth for Next.js App Router handlers.
 * - On success: returns payload { username, iat, exp }
 * - On failure: returns NextResponse 401 with WWW-Authenticate header
 */
export function requireAuth(req: Request): AuthUser | NextResponse {
  const header = req.headers.get("authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);

  if (!m) {
    return NextResponse.json(
      { message: "Missing Bearer token" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="api"' },
      }
    );
  }

  const token = m[1];

  try {
    const payload = verifyToken(token);
    const user: AuthUser = {
      username: (payload as any).username,
      iat: (payload as any).iat,
      exp: (payload as any).exp,
    };
    return user;
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer error="invalid_token"' },
      }
    );
  }
}

/**
 * 404 helper for API routes (optional)
 */
export function notFound() {
  return NextResponse.json({ message: "Route not found" }, { status: 404 });
}

/**
 * Generic error helper for API routes (optional)
 */
export function errorHandler(err: any) {
  console.error("❌ Error:", err);
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  return NextResponse.json({ message }, { status });
}
