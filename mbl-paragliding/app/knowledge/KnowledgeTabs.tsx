"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KNOWLEDGE_SUBS } from "@/lib/knowledge";

export default function KnowledgeTabs() {
  const pathname = usePathname(); // /knowledge/xc, /knowledge/all...
  const active = pathname.split("/").pop();

  return (
    <div className="mx-auto max-w-5xl mt-6">
      <div className="flex flex-wrap gap-3 rounded-3xl bg-white/15 backdrop-blur border border-white/20 p-3">
        {KNOWLEDGE_SUBS.map((s) => {
          const href = `/knowledge/${s.key}`;
          const isActive = active === s.key;
          return (
            <Link
              key={s.key}
              href={href}
              className={
                "px-5 py-2 rounded-2xl transition " +
                (isActive
                  ? "bg-white text-gray-900 font-semibold shadow"
                  : "text-white/90 hover:bg-white/20")
              }
            >
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
