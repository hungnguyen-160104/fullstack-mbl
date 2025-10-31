// components/posts/RecentPosts.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

/** Kiểu dữ liệu rút gọn để render */
type PostLite = {
  id?: string;
  slug: string;
  title: string;
  date?: string;
  thumbnail?: string | null;
  excerpt?: string;
};

function getBaseClient(): string {
  // Ưu tiên env công khai nếu có, fallback sang origin hiện tại
  const env = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return ""; // trong client luôn có window, đề phòng build
}

async function loadRecent(limit: number): Promise<PostLite[]> {
  const base = getBaseClient();
  const url = `${base}/api/posts/recent?limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return (await res.json()) as PostLite[];
}

export default function RecentPosts({
  limit = 3,
  title = "Bài viết mới nhất",
}: {
  limit?: number;
  title?: string;
}) {
  const [data, setData] = React.useState<PostLite[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    loadRecent(limit)
      .then((items) => mounted && setData(items))
      .catch((e) => {
        console.error("[RecentPosts] load error:", e);
        if (mounted) setError("Không tải được dữ liệu.");
      });
    return () => {
      mounted = false;
    };
  }, [limit]);

  // ====== Loading skeleton ======
  if (!data && !error) {
    return (
      <section className="relative z-10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="h-8 w-56 rounded-full bg-white/10 backdrop-blur-md mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-56 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ====== Error or empty ======
  if (error || !data || data.length === 0) {
    return (
      <section className="relative z-10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{title}</h2>
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-white/90">
            {error ? error : "Hiện chưa có bài viết nào."}
          </div>
        </div>
      </section>
    );
  }

  // ====== Render danh sách ======
  return (
    <section className="relative z-10 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((p) => (
            <Link
              key={p.id || p.slug}
              href={`/blog/${p.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white/15 backdrop-blur-md shadow-xl border border-white/20 transition"
            >
              <div className="relative h-48">
                <Image
                  src={p.thumbnail || "/post-fallback.jpg"}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>

              <div className="p-5 text-white">
                <h3 className="text-lg font-semibold line-clamp-2 mb-1">
                  {p.title}
                </h3>
                {p.date && (
                  <p className="text-xs text-white/80 mb-2">
                    {new Date(p.date).toLocaleDateString("vi-VN")}
                  </p>
                )}
                {p.excerpt && (
                  <p className="text-sm text-white/90 line-clamp-2 mb-3">
                    {p.excerpt}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  Xem chi tiết →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
