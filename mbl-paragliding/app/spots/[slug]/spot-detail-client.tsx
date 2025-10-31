"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Mountain, Clock, Feather } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";
import { Footer } from "@/components/footer";

/* =========================
   Types
========================= */
type SpotPackage = {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
};

type SpotData = {
  name: string;
  title: string;
  altitude: string;
  description: string;
  landscape: string;
  duration: string;
  landingPoint: string;
  basePrice: number;
  image: string;
  galleryImages: string[];
  packages: SpotPackage[];
};

type Story = {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  image: string;
};

/**
 * @description Trả về stories theo đúng 6 địa điểm trên trang (khớp tên linh hoạt)
 */
const getSpotStories = (spotName: string, galleryImages: string[]): Story[] => {
  // helper ảnh an toàn
  const img = (i: number, fallback: string) => galleryImages[i] ?? fallback;

  // ===== Stories cho từng điểm =====
  // 1) Mường Hoa – Sapa
  const sapaStories: Story[] = [
    {
      id: 1,
      title: "Bay trên thung lũng Mường Hoa",
      author: "Nguyễn Trung Hiếu",
      date: "20/03/2025",
      content:
        "Đường bay ôm thung lũng Mường Hoa, ruộng bậc thang xếp lớp và Fansipan sừng sững phía xa. Lên cao là chạm tầng mây mỏng — rất 'Sapa'.",
      image: img(0, "/placeholder-sapa-1.jpg"),
    },
    {
      id: 2,
      title: "Sương muối & ánh nắng",
      author: "Trần Bảo Ngọc",
      date: "12/12/2024",
      content:
        "Sáng sớm lạnh tê nhưng gió êm. Khi mặt trời ló, sương tan để lộ bản làng và ruộng bậc thang lấp lánh.",
      image: img(1, "/placeholder-sapa-2.jpg"),
    },
    {
      id: 3,
      title: "Hạ cánh ở Mường Hoa",
      author: "Đoàn Văn Sơn",
      date: "25/04/2025",
      content:
        "Hạ cánh giữa đồng lúa đang thì con gái, trẻ nhỏ chạy ra vẫy tay — kỷ niệm rất đáng nhớ.",
      image: img(2, "/placeholder-sapa-3.jpg"),
    },
  ];

  // 2) Sơn Trà – Đà Nẵng
  const sonTraStories: Story[] = [
    {
      id: 1,
      title: "Một bên rừng, một bên biển",
      author: "Lê Ngọc Ánh",
      date: "05/06/2025",
      content:
        "Từ sườn núi Sơn Trà phóng ra: trái là rừng, phải là biển xanh. Hạ cánh sát bãi cát mịn, quá đã.",
      image: img(0, "/placeholder-son-tra-1.jpg"),
    },
    {
      id: 2,
      title: "Đà Nẵng từ trên cao",
      author: "Võ Quang Huy",
      date: "12/07/2025",
      content:
        "Thấy trọn cầu Rồng và dải Mỹ Khê cong mềm. Gió biển đều giúp chuyến bay êm và dài.",
      image: img(1, "/placeholder-son-tra-2.jpg"),
    },
    {
      id: 3,
      title: "Gió biển ổn định",
      author: "Phan Thị Mai",
      date: "28/06/2025",
      content:
        "Ngày gió đẹp mình được thử kéo toggles nhẹ — video selfie nền biển xanh ngọc bích siêu 'đỉnh'.",
      image: img(2, "/placeholder-son-tra-3.jpg"),
    },
  ];

  // 3) Khau Phạ – Yên Bái
  const khauPhaStories: Story[] = [
    {
      id: 1,
      title: "Đèo Khau Phạ hùng vĩ",
      author: "Ngô Văn Phát",
      date: "10/09/2025",
      content:
        "Chênh cao lớn, lift tốt. Thung lũng Mù Cang Chải vàng rực ngay dưới chân — phấn khích tột độ.",
      image: img(0, "/placeholder-khau-pha-1.jpg"),
    },
    {
      id: 2,
      title: "Mùa lúa chín",
      author: "Hoàng Minh Tuấn",
      date: "01/10/2025",
      content:
        "Cả thung lũng thành tấm thảm vàng khổng lồ. Bay xong chỉ muốn vòng thêm nữa.",
      image: img(1, "/placeholder-khau-pha-2.jpg"),
    },
    {
      id: 3,
      title: "Nhìn từ đèo về thung lũng",
      author: "Phạm Thuỷ Tiên",
      date: "18/10/2025",
      content:
        "Điểm cất cánh thoáng, gió chuẩn; đội hỗ trợ chuyên nghiệp, lên là bay ngay.",
      image: img(2, "/placeholder-khau-pha-3.jpg"),
    },
  ];

  // 4) Trạm Tấu – Yên Bái
  const tramTauStories: Story[] = [
    {
      id: 1,
      title: "Yên bình Trạm Tấu",
      author: "Đinh Thị Quỳnh",
      date: "15/10/2025",
      content:
        "Gió nhẹ, không gian rộng. Lượn trên cánh đồng và suối nước nóng — đúng chất thư giãn cuối tuần.",
      image: img(0, "/placeholder-tram-tau-1.jpg"),
    },
    {
      id: 2,
      title: "Mây lững lờ",
      author: "Vũ Hải Long",
      date: "22/04/2025",
      content:
        "Độ cao vừa phải, hợp người mới. Có lúc lướt qua tầng mây mỏng, cảnh ôm sườn núi đẹp bất ngờ.",
      image: img(1, "/placeholder-tram-tau-2.jpg"),
    },
    {
      id: 3,
      title: "Hạ cánh êm như nhung",
      author: "Nguyễn Minh Châu",
      date: "03/05/2025",
      content:
        "Bãi hạ cánh rộng, gió đều nên touchdown rất mượt. Team quay/chụp nhiệt tình.",
      image: img(2, "/placeholder-tram-tau-3.jpg"),
    },
  ];

  // 5) Viên Nam – Hòa Bình
  const vienNamStories: Story[] = [
    {
      id: 1,
      title: "Thung lũng Viên Nam",
      author: "Bùi Đức Mạnh",
      date: "09/06/2025",
      content:
        "Launch nhìn xuống thung lũng xanh mướt, dải núi nối nhau đã mắt. Ngày mình đi gió sạch và ổn định.",
      image: img(0, "/placeholder-vien-nam-1.jpg"),
    },
    {
      id: 2,
      title: "Đi gần Hà Nội",
      author: "Phạm Thu Huyền",
      date: "21/06/2025",
      content:
        "Sáng xuất phát Hà Nội, 1–1.5 giờ là tới. Bay xong vẫn kịp về ăn trưa — quá tiện!",
      image: img(1, "/placeholder-vien-nam-2.jpg"),
    },
    {
      id: 3,
      title: "Đồi thông & gió laminar",
      author: "Hoàng Nhật Tân",
      date: "02/07/2025",
      content:
        "Ngày gió nam lift bền, treo lâu trên sườn — hợp luyện cảm giác cho người mới.",
      image: img(2, "/placeholder-vien-nam-3.jpg"),
    },
  ];

  // 6) Đồi Bù – Hà Nội
  const doiBuStories: Story[] = [
    {
      id: 1,
      title: "Chuyến bay đầu đời",
      author: "Phạm Khánh Linh",
      date: "15/05/2025",
      content:
        "Đồi Bù là 'địa điểm nhập môn' tuyệt vời: đường vào dễ, bãi hạ cánh rộng, đội ngũ đông. Cảm giác cất cánh lần đầu khó quên.",
      image: img(0, "/placeholder-doi-bu-1.jpg"),
    },
    {
      id: 2,
      title: "Hoàng hôn ngoại thành",
      author: "Trịnh Mỹ Dung",
      date: "30/06/2025",
      content:
        "Chiều muộn gió mát, bầu trời chuyển cam. Lơ lửng nhìn hồ và cánh đồng vùng Xuân Sơn đẹp mê ly.",
      image: img(1, "/placeholder-doi-bu-2.jpg"),
    },
    {
      id: 3,
      title: "Gần mà chất",
      author: "Nguyễn Huyền Trang",
      date: "01/09/2025",
      content:
        "Từ nội thành chạy hơn tiếng là tới. Gần Hà Nội nhưng cảnh đồi núi thoáng đãng, bay xong còn kịp cafe view hồ.",
      image: img(2, "/placeholder-doi-bu-3.jpg"),
    },
  ];

  // ===== Chuẩn hoá & so khớp tên =====
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/[^a-z0-9]+/g, " ") // bỏ ký tự lạ (–, -, _, …)
      .trim();

  const key = normalize(spotName);

  if (/(^| )sapa( |$)/.test(key) || /muong hoa/.test(key)) return sapaStories;
  if (/son tra/.test(key)) return sonTraStories;
  if (/khau pha/.test(key)) return khauPhaStories;
  if (/tram tau/.test(key)) return tramTauStories;
  if (/vien nam/.test(key)) return vienNamStories;
  if (/doi bu/.test(key)) return doiBuStories;

  // ===== Fallback trung lập (không gán nhầm sang Đồi Bù) =====
  return [
    {
      id: 1,
      title: "Khoảnh khắc đáng nhớ",
      author: "Mebayluon Team",
      date: "—",
      content:
        "Một vài khoảnh khắc đẹp từ chuyến bay gần đây. Tận hưởng gió và cảnh quan tuyệt vời từ trên cao!",
      image: img(0, "/placeholder-generic-1.jpg"),
    },
    {
      id: 2,
      title: "Gió đẹp, bay mượt",
      author: "Mebayluon Team",
      date: "—",
      content:
        "Điều kiện gió ổn định giúp chuyến bay êm ái và an toàn — thích hợp cả cho người mới.",
      image: img(1, "/placeholder-generic-2.jpg"),
    },
    {
      id: 3,
      title: "Hạ cánh an toàn",
      author: "Mebayluon Team",
      date: "—",
      content:
        "Kết thúc hành trình bằng một cú touchdown mượt mà, lưu lại kỷ niệm bằng ảnh và video.",
      image: img(2, "/placeholder-generic-3.jpg"),
    },
  ];
};


export function SpotDetailClient({ spot }: { spot: SpotData }) {
  const { t } = useLanguage();

  const stories = getSpotStories(spot.name, spot.galleryImages);

  return (
    <main
      className="min-h-screen relative bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: `url(${spot.image})` }}
    >
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center -mt-16 z-10">
        <motion.div
          className="relative z-10 container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
        >
          <Badge className="mb-4 text-base px-4 py-1.5 bg-accent/80 backdrop-blur-sm border border-white/20">
            {spot.name}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif">
            {spot.title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto text-slate-200">
            {spot.landscape}
          </p>
          <div className="flex items-center justify-center gap-6 text-lg text-slate-100">
            <div className="flex items-center gap-2">
              <Mountain size={20} />
              <span>{spot.altitude}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span>{spot.duration}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Description */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto p-8 md:p-12 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg"
          >
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Col 1-2 */}
              <div className="lg:col-span-2 space-y-6 border-b lg:border-b-0 lg:border-r border-white/20 lg:pr-10 pb-8 lg:pb-0">
                <h2 className="text-4xl font-bold font-serif text-white">
                  {t.spotDetail?.aboutTitle || "Về điểm bay này"}
                </h2>
                <p className="text-lg text-slate-200 leading-relaxed">
                  {spot.description}
                </p>
                <p className="text-md text-slate-300 italic">
                  {t.spotDetail?.landscapeIntro || "Cảnh quan chính:"}{" "}
                  <span className="font-semibold">{spot.landscape}</span>
                </p>
              </div>

              {/* Col 3 - Quick facts */}
              <div className="lg:col-span-1 space-y-6 pt-6 lg:pt-0">
                <h3 className="text-2xl font-semibold mb-4 border-b border-white/20 pb-2">
                  Thông số nhanh
                </h3>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 transition-transform duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Mountain className="text-accent" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {t.spotDetail?.altitude || "Độ Cao Cất Cánh"}
                    </h4>
                    <p className="text-slate-200 font-bold">{spot.altitude}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 transition-transform duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Clock className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {t.spotDetail?.flightTime || "Thời Gian Bay"}
                    </h4>
                    <p className="text-slate-200 font-bold">{spot.duration}</p>
                    <p className="text-xs text-slate-400">
                      ({t.spotDetail?.windDependent || "tùy điều kiện gió"})
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 transition-transform duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <Feather className="text-sky-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">
                      {t.spotDetail?.feeling || "Cảm Giác"}
                    </h4>
                    <p className="text-slate-200 font-bold">
                      {t.spotDetail?.smoothAir || "Êm ái, ổn định"}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      {spot.galleryImages && spot.galleryImages.length > 0 && (
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold font-serif mb-12 text-center text-white"
            >
              {t.spotDetail?.galleryTitle || "Khoảnh khắc tại đây"}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spot.galleryImages.map((src, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl border border-white/20"
                >
                  <Image
                    src={src}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stories */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 font-serif text-white">
              {t.spotDetail?.storyTitle || "Câu chuyện và Trải nghiệm"}
            </h2>
            <p className="text-lg text-slate-200">
              {t.spotDetail?.storySubtitle ||
                "Lắng nghe những chia sẻ đáng nhớ từ du khách"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="group relative h-full bg-black/20 backdrop-blur-lg border border-white/20 text-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Content */}
                  <CardContent className="pt-6 pb-6 space-y-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold font-serif group-hover:text-accent transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-4 flex-grow">
                      {story.content}
                    </p>
                    <div className="mt-auto flex justify-between items-center text-xs text-slate-400 border-t border-white/10 pt-3">
                      <span className="font-semibold">{story.author}</span>
                      <span className="font-light">{story.date}</span>
                    </div>
                  </CardContent>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center p-12 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg max-w-4xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif text-white">
            {t.spotDetail?.exploreMore || "Explore other flying spots"}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-slate-200">
            {t.spotDetail?.exploreMoreDescription ||
              "We have many other beautiful flying spots across Vietnam"}
          </p>

          {/* ✅ FIX: dùng <a> trong Button asChild để tránh lỗi Slot + Next Link */}
          <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90 h-14 px-8">
            <a href="/#flying-spots">
              <span>{t.spotDetail?.viewAllSpots || "View all flying spots"}</span>
            </a>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <div className="relative z-10 pt-16">
        <div className="container mx-auto">
          <Footer />
        </div>
      </div>
    </main>
  );
}
