"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertTriangle, Shirt, PackageCheck } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import Image from "next/image" // Import Image để tối ưu

export default function PreNoticePage() {
  const { t } = useLanguage()

  // Dữ liệu mẫu (bạn có thể lấy từ file ngôn ngữ)
  const content = {
    preparation: {
      title: t.preNotice?.preparation?.title ?? "Chuẩn bị trước khi bay",
      clothing: {
        title: t.preNotice?.preparation?.clothing?.title ?? "Trang phục",
        items: t.preNotice?.preparation?.clothing?.items ?? ["Quần áo gọn gàng, thoải mái", "Giày thể thao, mũi kín", "Kính râm (nếu cần)"],
      },
      items: {
        title: t.preNotice?.preparation?.items?.title ?? "Vật dụng nên mang",
        list: t.preNotice?.preparation?.items?.list ?? ["Điện thoại/Máy ảnh", "Kem chống nắng", "Tâm lý thoải mái, sẵn sàng trải nghiệm!"],
      }
    },
    posters: {
      title: "Lưu ý quan trọng",
      subtitle: "Tóm tắt các quy định & chuẩn bị cần thiết. Nhấp vào ảnh để xem bản lớn."
    },
    requirements: {
      title: t.preNotice?.requirements?.title ?? "Yêu cầu & Quy định",
      eligible: {
        title: t.preNotice?.requirements?.eligible?.title ?? "Điều kiện tham gia",
        items: t.preNotice?.requirements?.eligible?.items ?? ["Sức khỏe tốt, không sợ độ cao", "Cân nặng từ 25kg - 100kg", "Tuân thủ hướng dẫn của phi công"],
      },
      notEligible: {
        title: t.preNotice?.requirements?.notEligible?.title ?? "Không phù hợp nếu bạn",
        items: t.preNotice?.requirements?.notEligible?.items ?? ["Có bệnh về tim mạch, huyết áp", "Có vấn đề về xương khớp", "Đang mang thai"],
      },
      special: {
        title: t.preNotice?.requirements?.special?.title ?? "Lưu ý đặc biệt",
        items: t.preNotice?.requirements?.special?.items ?? ["Không sử dụng chất kích thích trước khi bay", "Ăn nhẹ trước chuyến bay khoảng 1-2 tiếng", "Thông báo cho phi công nếu cảm thấy không khỏe"],
      }
    }
  }

  return (
    <main
      className="min-h-screen relative bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: "url(/per-flight.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/20 z-0" />
      <div className="relative z-20">
        <Navigation />
      </div>

      {/* HERO SECTION */}
      <section className="relative h-[60vh] flex items-center justify-center -mt-16 z-10">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-serif" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
            {t.preNotice.title}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200" style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.7)' }}>
            {t.preNotice.subtitle}
          </p>
        </motion.div>
      </section>

      {/* CHUẨN BỊ TRƯỚC KHI BAY */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 font-serif text-white">
              {content.preparation.title}
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Trang phục */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="transition-transform duration-300"
            >
              <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Shirt /> {content.preparation.clothing.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {content.preparation.clothing.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={20} />
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vật dụng */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="transition-transform duration-300"
            >
              <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <PackageCheck /> {content.preparation.items.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {content.preparation.items.list.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={20} />
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* POSTERS SECTION */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-3 font-serif">{content.posters.title}</h2>
            <p className="text-slate-200 max-w-3xl mx-auto">{content.posters.subtitle}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { img: "/preflight/quy-dinh-ve-trang-phuc.jpg", alt: "Quy định trang phục" },
              { img: "/preflight/quy-dinh-voi-hanh-khach.jpg", alt: "Quy định hành khách" },
            ].map((poster, index) => (
              <motion.a
                key={index}
                href={poster.img}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.03 }}
                transition={{ delay: index * 0.1 }}
                className="block rounded-xl overflow-hidden shadow-lg border border-white/20"
              >
                <Image
                  src={poster.img}
                  alt={poster.alt}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* YÊU CẦU & QUY ĐỊNH */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 font-serif text-white">
              {content.requirements.title}
            </h2>
          </motion.div>
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Điều kiện tham gia */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <CheckCircle2 className="text-green-400" /> {content.requirements.eligible.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {content.requirements.eligible.items.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={18} />
                          <span className="text-slate-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Không phù hợp */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <Card className="h-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <XCircle className="text-red-400" /> {content.requirements.notEligible.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {content.requirements.notEligible.items.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <XCircle className="text-red-400 mt-1 flex-shrink-0" size={18} />
                          <span className="text-slate-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Lưu ý đặc biệt */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <AlertTriangle className="text-yellow-400" /> {content.requirements.special.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {content.requirements.special.items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
                        <span className="text-slate-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  )
}