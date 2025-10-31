// app/api/posts/slug/[slug]/view/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { addView } from "@/services/post.service";

export async function POST(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const result = await addView(params.slug);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/posts/slug/[slug]/view error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
