import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

const formatDate = (s: string) =>
  s ? new Date(s).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" }) : "Không rõ ngày đăng";

/** Base URL:
 * - PROD: dùng NEXT_PUBLIC_API_BASE_URL nếu có
 * - SSR:  fallback http://localhost:8080 (cùng app)
 * - Browser: dùng same-origin nên trả "" để ghép /api/...
 */
function getApiBase() {
  const pub = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (pub) return pub;
  return typeof window === "undefined" ? "http://localhost:8080" : "";
}

async function getBlogPosts() {
  const base = getApiBase();
  const url = `${base}/api/posts?isPublished=true&category=news`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("❌ Fetch blog posts failed:", res.status, res.statusText);
    return { items: [], total: 0 };
  }
  return res.json();
}

export default async function BlogPage() {
  const data = await getBlogPosts();

  return (
    <div className="min-h-screen relative bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/hinh-nen.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 z-0" />
      <main className="container mx-auto px-4 py-16 relative z-10 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-12 text-center drop-shadow-lg font-serif">
          {data.items?.length ? "Tin tức & Blog" : "Blog"}
        </h1>

        <Suspense fallback={<p className="text-xl text-center text-white">Đang tải bài viết...</p>}>
          {data.items?.length ? (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((p: any) => (
                <li key={p._id}>
                  <Link href={`/blog/${p.slug}`} className="group">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      {p.coverImage && (
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image src={p.coverImage} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors">{p.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/70 mb-3">
                          <span>{formatDate(p.createdAt)}</span>
                          <span>{p.views || 0} lượt xem</span>
                        </div>
                        {p.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {p.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-white/80 text-sm line-clamp-3">{(p.content || "").replace(/<[^>]*>/g, "").substring(0, 120)}…</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-white/70 mb-8">Chưa có bài viết nào được xuất bản</p>
              <Link href="/admin/posts/new" className="inline-block bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/80 transition-colors">
                Tạo bài viết đầu tiên
              </Link>
            </div>
          )}
        </Suspense>
      </main>
    </div>
  );
}
