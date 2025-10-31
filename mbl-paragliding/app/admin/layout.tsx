// mbl-paragliding/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Guard tất cả route admin trừ /admin/login
  useEffect(() => {
    if (pathname?.startsWith("/admin") && pathname !== "/admin/login") {
      const token = getToken();
      if (!token) {
        router.replace("/admin/login");
        return;
      }
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return <div className="p-6">Đang kiểm tra phiên đăng nhập…</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="font-semibold">MBL Admin</Link>
            <Link href="/admin/posts/new">Tạo bài</Link>
          </div>
          <button
            onClick={() => {
              clearToken();
              router.push("/admin/login");
            }}
            className="text-sm underline"
          >
            Đăng xuất
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
