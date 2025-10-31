// app/api/posts/recent/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post.model";

/**
 * Trả về các bài viết mới nhất (published)
 * Query: ?limit=3&lang=vi (tùy chọn)
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limitNum = Math.min(12, Math.max(1, Number(searchParams.get("limit") || "3")));
    const lang = searchParams.get("lang");

    const q: any = { isPublished: { $ne: false } };
    if (lang) q.language = lang;

    const items = await Post.find(q)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limitNum)
      .select("slug title excerpt content thumbnail coverImage createdAt publishedAt")
      .lean();

    const data = items.map((p: any) => {
      const desc =
        p.excerpt ||
        String(p.content || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 140);

      return {
        id: p._id?.toString?.(),
        slug: p.slug,
        title: p.title,
        date: p.publishedAt ?? p.createdAt,
        thumbnail: p.thumbnail ?? p.coverImage ?? null,
        excerpt: desc,
      };
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[API] /posts/recent", err);
    return NextResponse.json({ error: "Failed to load recent posts" }, { status: 500 });
  }
}
