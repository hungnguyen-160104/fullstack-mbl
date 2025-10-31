import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
// Nếu Post export default:  import Post from "@/models/Post.model";
import { Post } from "@/models/Post.model";
import { Types } from "mongoose";

type CurrentPostLean = {
  _id: Types.ObjectId;
  slug: string;
  category?: string | string[];
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const idOrSlug = params.id;
    const isObjId =
      Types.ObjectId.isValid(idOrSlug) &&
      String(new Types.ObjectId(idOrSlug)) === idOrSlug;

    const current = await Post.findOne(
      isObjId ? { _id: idOrSlug } : { slug: idOrSlug }
    )
      .select("_id slug category")
      .lean<CurrentPostLean>()
      .exec();

    if (!current) return NextResponse.json([], { status: 200 });

    const categories = Array.isArray(current.category)
      ? current.category
      : current.category
      ? [current.category]
      : [];

    const q: any = {
      _id: { $ne: current._id },
      isPublished: { $ne: false },
    };
    if (categories.length) q.category = { $in: categories };

    const limit = 4;

    const related = await Post.find(q)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .select(
        "slug title excerpt thumbnail coverImage category createdAt publishedAt"
      )
      .lean();

    const data = related.map((p: any) => ({
      ...p,
      id: p._id?.toString?.(),
      date: p.publishedAt ?? p.createdAt,
      thumbnail: p.thumbnail ?? p.coverImage ?? null,
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[API] /posts/[id]/related", err);
    return NextResponse.json(
      { error: "Failed to load related posts" },
      { status: 500 }
    );
  }
}
