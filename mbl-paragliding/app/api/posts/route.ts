// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post.model"; // giữ named import đúng với model của bạn
import type { SortOrder } from "mongoose";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/* -------------------- Helpers -------------------- */
function toBool(v: string | null): boolean | undefined {
  if (v == null) return undefined;
  const s = v.trim().toLowerCase();
  if (["true", "1", "yes", "y", "on", "published", "public"].includes(s)) return true;
  if (["false", "0", "no", "n", "off", "draft"].includes(s)) return false;
  return undefined;
}

// Loại dấu tiếng Việt & tạo slug không cần thư viện
function slugifyVN(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function buildSort(s?: string): string | [string, SortOrder][] | Record<string, SortOrder> {
  const v = (s ?? "-createdAt").trim();
  if (v.includes(",")) {
    return v
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
      .map<[string, SortOrder]>((f) => (f.startsWith("-") ? [f.slice(1), "desc"] : [f, "asc"]));
  }
  if (v.startsWith("-")) return { [v.slice(1)]: "desc" };
  return { [v]: "asc" };
}

// Map label ↔︎ slug cho Knowledge để bao phủ dữ liệu cũ (label) & mới (slug)
const KNOWLEDGE_LABEL_TO_SLUG: Record<string, string> = {
  "Dù lượn căn bản": "can-ban",
  "Dù lượn nâng cao": "nang-cao",
  "Bay thermal": "thermal",
  "Bay XC": "xc",
  "Khí tượng bay": "khi-tuong",
};
const KNOWLEDGE_SLUG_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(KNOWLEDGE_LABEL_TO_SLUG).map(([label, slug]) => [slug, label]),
);
const CATEGORY_LABEL_TO_KEY: Record<string, string> = {
  "Kiến thức dù lượn": "knowledge",
  "Cửa hàng": "store",
};

/* -------------------- GET: list posts -------------------- */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    // ----- Input params -----
    let categoryParam = searchParams.get("category")?.trim() || undefined;
    const subParam = searchParams.get("subCategory")?.trim() || undefined;
    const storeParam = searchParams.get("storeCategory")?.trim() || undefined;

    // published: published / isPublished / status
    const p = toBool(
      searchParams.get("published") ??
        searchParams.get("isPublished") ??
        searchParams.get("status"),
    );
    // Mặc định: hiển thị bài đã xuất bản (bao gồm doc không có field)
    const wantPublished = p === undefined ? true : p;

    // ----- Build filter “nới lỏng” bao phủ dữ liệu cũ -----
    const filter: Record<string, any> = {};

    // category: chấp nhận key hoặc label, không phân biệt hoa-thường
    if (categoryParam) {
      const canon = CATEGORY_LABEL_TO_KEY[categoryParam] || categoryParam;
      if (canon === "knowledge") {
        filter.$and = (filter.$and || []).concat({
          $or: [
            { category: new RegExp("^knowledge$", "i") },
            { category: new RegExp("^Kiến thức dù lượn$", "i") },
          ],
        });
      } else if (canon === "store") {
        filter.$and = (filter.$and || []).concat({
          $or: [{ category: new RegExp("^store$", "i") }, { category: new RegExp("^Cửa hàng$", "i") }],
        });
      } else {
        filter.category = new RegExp(`^${canon}$`, "i");
      }
    }

    // subCategory (knowledge): chấp nhận slug hoặc label
    if (subParam && subParam !== "all") {
      const label = KNOWLEDGE_SLUG_TO_LABEL[subParam];
      const $or: any[] = [{ subCategory: new RegExp(`^${subParam}$`, "i") }];
      if (label) $or.push({ subCategory: new RegExp(`^${label}$`, "i") });
      filter.$and = (filter.$and || []).concat({ $or });
    }

    // storeCategory (nếu cần label → thêm map tương tự)
    if (storeParam) {
      filter.storeCategory = new RegExp(`^${storeParam}$`, "i");
    }

    // Xuất bản: kiểu loại trừ (bao phủ doc thiếu field)
    if (wantPublished === true) {
      filter.$and = (filter.$and || []).concat({
        $and: [{ isPublished: { $ne: false } }, { published: { $ne: false } }, { status: { $not: /^draft$/i } }],
      });
    } else {
      filter.$and = (filter.$and || []).concat({
        $or: [{ isPublished: false }, { published: false }, { status: /^draft$/i }],
      });
    }

    // Search (tuỳ chọn)
    const term = (searchParams.get("q") ?? searchParams.get("search"))?.trim();
    if (term) {
      filter.$and = (filter.$and || []).concat({
        $or: [{ title: { $regex: term, $options: "i" } }, { content: { $regex: term, $options: "i" } }],
      });
    }

    // Paging & sort
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sort = buildSort(searchParams.get("sort") ?? "-createdAt");

    const [items, total] = await Promise.all([
      Post.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    return NextResponse.json(
      { items, total, page, limit },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/* -------------------- POST: create post -------------------- */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Chuẩn hoá isPublished (nếu gửi string)
    if (typeof body.isPublished === "string") {
      const b = toBool(body.isPublished);
      if (b !== undefined) body.isPublished = b;
    }

    // Map label -> key chuẩn (nếu form gửi label tiếng Việt)
    if (body.category === "Kiến thức dù lượn") body.category = "knowledge";
    if (body.category === "Cửa hàng") body.category = "store";
    if (body.subCategory && KNOWLEDGE_LABEL_TO_SLUG[body.subCategory]) {
      body.subCategory = KNOWLEDGE_LABEL_TO_SLUG[body.subCategory];
    }

    // Tạo slug nếu thiếu, và đảm bảo duy nhất
    if (!body.slug && body.title) {
      const base = slugifyVN(String(body.title)).slice(0, 80);
      let slug = base || `post-${Date.now().toString(36)}`;
      let i = 1;
      while (await Post.exists({ slug })) slug = `${base}-${i++}`;
      body.slug = slug;
    }
    if (!body.slug) {
      body.slug = `post-${Date.now().toString(36)}`;
    }

    const created = await Post.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
