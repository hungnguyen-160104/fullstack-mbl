import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { LanguageProvider } from "@/contexts/language-context";
import { Navigation } from "@/components/navigation"; 
import { FloatingSocial } from "@/components/floating-social";
import { buildMetadata, generateOrganizationSchema } from "@/lib/metadata-builder";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Mebayluon Paragliding - Bay Dù Lượn Tự Do Tại Việt Nam",
    description: "Trải nghiệm bay dù lượn tự do trên khắp Việt Nam - Sapa, Đà Lạt, Nha Trang, Mộc Châu, Tam Đảo, Hà Giang. Hướng dẫn chuyên nghiệp, tour trọn gói, chuẩn bị kỹ lưỡng.",
    keywords: [
      "bay dù lượn",
      "paragliding vietnam",
      "dù lượn",
      "bay dù",
      "tour bay dù",
      "sapa paragliding",
      "đà lạt paragliding"
    ],
    author: "Mebayluon Team",
    type: "website",
  }),
  applicationName: "Mebayluon",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mebayluon",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body 
        className={`font-sans ${GeistSans.variable} ${montserrat.variable}`}
        suppressHydrationWarning
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