// app/knowledge/[sub]/page.tsx
import Image from "next/image";
import Link from "next/link";
import KnowledgeTabs from "../KnowledgeTabs";
import type { KnowledgeKey } from "@/lib/knowledge";
import { headers } from "next/headers";

const fmtDate = (s?: string) =>
  s
    ? new Date(s).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Không rõ ngày đăng";

// Lấy base URL đúng trong mọi môi trường (Next 15: headers() là Promise)
async function getApiBase(): Promise<string> {
  const publicBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  if (publicBase) return publicBase.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  // Fallback dev (Next chạy cổng 8080)
  return "http://localhost:8080";
}

type PostItem = {
  _id: string;
  slug: string;
  title: string;
  content?: string;
  createdAt?: string;
  views?: number;
  coverImage?: string;
};

async function fetchPosts(sub: KnowledgeKey) {
  const base = await getApiBase();

  const qs = new URLSearchParams({
    category: "knowledge",
    published: "true", // ✅ đổi từ isPublished -> published
  });
  if (sub && sub !== "all") qs.set("subCategory", sub);

  const res = await fetch(`${base}/api/posts?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return { items: [] as PostItem[], total: 0 };
  return (await res.json()) as { items: PostItem[]; total: number };
}

export default async function Page({
  params,
}: {
  params: Promise<{ sub: KnowledgeKey }>;
}) {
  // ✅ Next 15: params là Promise, phải await
  const { sub } = await params;
  const data = await fetchPosts(sub);

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{ backgroundImage: "url('/hinh-nen.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/35" />

      <main className="relative z-10 container mx-auto px-4 py-14 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center drop-shadow-lg">
          Kiến thức dù lượn
        </h1>

        <KnowledgeTabs />

        {data.items.length ? (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <li key={p._id}>
                <Link href={`/blog/${p.slug}`} className="group">
                  <div className="bg-white/10 backdrop-blur rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition">
                    {p.coverImage ? (
                      <div className="relative h-44 w-full">
                        <Image
                          src={p.coverImage}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : null}
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent">
                        {p.title}
                      </h3>
                      <div className="text-sm text-white/70 mb-2">
                        {fmtDate(p.createdAt)} • {p.views ?? 0} lượt xem
                      </div>
                      <p className="text-white/80 text-sm line-clamp-3">
                        {String(p.content || "")
                          .replace(/<[^>]*>/g, "")
                          .slice(0, 120)}
                        …
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-14 text-center text-xl text-white/85">
            Chưa có bài trong mục này.
          </p>
        )}
      </main>
    </div>
  );
}
