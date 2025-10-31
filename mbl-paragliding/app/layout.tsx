import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { LanguageProvider } from "@/contexts/language-context";
import { Navigation } from "@/components/navigation"; 
import { FloatingSocial } from "@/components/floating-social";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mebayluon Paragliding - Fly Above Vietnam",
  description:
    "Trải nghiệm bay dù lượn tự do trên khắp Việt Nam - Sapa, Đà Lạt, Nha Trang, Mộc Châu, Tam Đảo, Hà Giang",
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Bỏ 'suppressHydrationWarning' khỏi thẻ <html>
    <html lang="vi">
      <body 
        className={`font-sans ${GeistSans.variable} ${montserrat.variable}`}
        suppressHydrationWarning // <-- THÊM VÀO ĐÂY
      >
        <LanguageProvider>
          <Suspense fallback={null}>
            <Navigation /> 
            <main>{children}</main> 
            <FloatingSocial />
            <Analytics />
            {/* <Footer /> */}
          </Suspense>
        </LanguageProvider>
      </body>
    </html>
  );
}