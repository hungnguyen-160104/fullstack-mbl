// app/api/uploads/debug/route.ts
import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET() {
  const cfg = cloudinary.config() as any;
  const key: string = cfg?.api_key ? String(cfg.api_key) : "";
  return NextResponse.json({
    cloud_name: cfg?.cloud_name || null,
    api_key_masked: key ? key.slice(0, 4) + "…" + key.slice(-4) : null,
  });
}
