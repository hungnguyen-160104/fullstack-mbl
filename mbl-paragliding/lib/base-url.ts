// lib/base-url.ts
import { headers } from "next/headers";

export function getBaseUrl() {
  // Ưu tiên biến môi trường nếu bạn có set sẵn
  const env = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (env) return env;

  // Lấy host/proto từ request headers (KHÔNG dùng await cho headers())
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  // Fallback đúng cổng dev của bạn (8080)
  return host ? `${proto}://${host}` : "http://localhost:8080";
}
