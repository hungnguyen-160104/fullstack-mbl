"use client";

import { useState, useEffect } from "react";
import { listProductsByCategory } from "@/lib/product-api";
import ProductCard from "./components/ProductCard";
import type { Post, StoreCategory } from "@/types/frontend/post";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

const CATEGORIES = [
  { key: "all", title: "Tất cả" },
  { key: "thiet-bi-bay", title: "Thiết bị bay" },
  { key: "phu-kien", title: "Phụ kiện" },
  { key: "sach-du-luon", title: "Sách dù lượn" },
  { key: "khoa-hoc-du-luon", title: "Khoá học dù lượn" },
] as const;

export default function StoreHomePage() {
  const [active, setActive] = useState<StoreCategory | "all">("all");
  const [products, setProducts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchProducts(category: StoreCategory | "all") {
    setLoading(true);
    try {
      if (category === "all") {
        // Gọi song song các danh mục để gom toàn bộ sản phẩm
        const results = await Promise.all(
          CATEGORIES.filter((c) => c.key !== "all").map((c) =>
            listProductsByCategory({ category: c.key as StoreCategory })
          )
        );
        const merged = results.flatMap((r) => r.items);
        setProducts(merged);
      } else {
        const res = await listProductsByCategory({ category });
        setProducts(res.items);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts("all");
  }, []);

  return (
    <main
      className="min-h-screen relative bg-cover bg-center"
      style={{ backgroundImage: "url(/hinh-nen.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-10">
            CỬA HÀNG
          </h1>

          {/* 🔹 Thanh menu ngang glassmorphism */}
          <div className="w-fit mx-auto flex flex-wrap justify-center gap-3 mb-12 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl px-6 py-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setActive(c.key as any);
                  fetchProducts(c.key as any);
                }}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  active === c.key
                    ? "bg-white/70 text-black shadow-md"
                    : "text-white hover:bg-white/10"
                )}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* 🔹 Danh sách sản phẩm */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-center text-white text-lg mt-10">
              Không có sản phẩm nào trong danh mục này.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
