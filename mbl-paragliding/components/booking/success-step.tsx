"use client";

import React, { useMemo, useRef, useState } from "react";
import { useBookingStore } from "@/store/booking-store";
import { LOCATIONS, computePriceByLang } from "@/lib/booking/calculate-price";
import { useBookingText, useLangCode } from "@/lib/booking/translations-booking";
import BookingTicket from "@/components/booking/BookingTicket";

export default function SuccessStep() {
  const t = useBookingText();
  const lang = useLangCode();

  const data = useBookingStore((s) => s.data);
  const bookingResult = useBookingStore((s) => s.bookingResult);
  const reset = useBookingStore((s) => s.reset);

  const cfg = LOCATIONS[data.location];

  const zaloQR = process.env.NEXT_PUBLIC_ZALO_QR_URL;
  const whatsappQR = process.env.NEXT_PUBLIC_WHATSAPP_QR_URL;

  const totals = computePriceByLang(
    {
      location: data.location,
      guestsCount: data.guestsCount,
      dateISO: data.dateISO,
      addons: data.addons,
      addonsQty: data.addonsQty,
    },
    lang
  );

  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fileName = useMemo(() => {
    const loc = data.location || "booking";
    const date = (data.dateISO || "date").replaceAll("/", "-");
    return `ticket-${loc}-${date}.pdf`;
  }, [data.location, data.dateISO]);

  const downloadPDF = async () => {
    if (!ticketRef.current) return;

    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // Multi-page nếu nội dung dài
      let y = 0;
      while (y < imgHeight) {
        pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
        y += pageHeight;
        if (y < imgHeight) pdf.addPage();
      }

      pdf.save(fileName);
    } catch (e) {
      console.error("Download PDF failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const glassWrapperClass =
    "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-5 space-y-6";
  const innerBlockClass = "rounded-2xl border border-white/40 p-4 text-center";
  const mapButtonStyle =
    "inline-flex items-center justify-center px-2 py-1 ml-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition";

  return (
    <div className="space-y-6 text-white">
      {/* NEW: Vé + nút tải PDF */}
      <div className={glassWrapperClass}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold text-white">
            {lang === "vi" ? "Vé đặt bay (PDF)" : "Booking ticket (PDF)"}
          </h3>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 disabled:opacity-60"
          >
            {downloading ? (lang === "vi" ? "Đang tạo PDF..." : "Generating...") : (lang === "vi" ? "Tải vé PDF" : "Download PDF")}
          </button>
        </div>

        {/* phần này được capture để xuất PDF */}
        <div ref={ticketRef} className="mt-4">
          <BookingTicket booking={data} bookingResult={bookingResult} totals={totals} lang={lang} />
        </div>
      </div>

      {/* Nội dung success cũ */}
      <div className={glassWrapperClass}>
        <h3 className="text-lg font-semibold text-white">{t.messages.successTitle}</h3>
        <p className="text-white/90">{t.messages.successBody}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zaloQR && (
            <div className={innerBlockClass}>
              <div className="font-medium text-white">QR Zalo</div>
              <img src={zaloQR} alt="Zalo QR" className="mx-auto mt-2 max-h-64 rounded-lg" />
            </div>
          )}
          {whatsappQR && (
            <div className={innerBlockClass}>
              <div className="font-medium text-white">QR WhatsApp</div>
              <img src={whatsappQR} alt="WhatsApp QR" className="mx-auto mt-2 max-h-64 rounded-lg" />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/40 p-4">
          <h4 className="font-semibold text-white">{t.messages.preflightTitle}</h4>
          <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-white/80">
            <li>{t.messages.preflightNotes[0]}</li>
            <li>{t.messages.preflightNotes[1]}</li>
            <li>
              {t.messages.preflightNotes[2]}
              {cfg.coordinates?.takeoff && (
                <>
                  {" "}
                  Cất cánh:
                  <a className={mapButtonStyle} href={cfg.coordinates.takeoff} target="_blank" rel="noreferrer">
                    {t.buttons.viewMap}
                  </a>
                </>
              )}
              {cfg.coordinates?.landing && (
                <>
                  {" "}
                  • Hạ cánh:
                  <a className={mapButtonStyle} href={cfg.coordinates.landing} target="_blank" rel="noreferrer">
                    {t.buttons.viewMap}
                  </a>
                </>
              )}
              {cfg.coordinates?.pickup && (
                <>
                  {" "}
                  • Điểm đón (HN):
                  <a className={mapButtonStyle} href={cfg.coordinates.pickup} target="_blank" rel="noreferrer">
                    {t.buttons.viewMap}
                  </a>
                </>
              )}
            </li>
          </ol>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl border border-white/40 bg-black/30 text-white hover:bg-black/50 transition backdrop-blur-sm"
        >
          {t.buttons.startOver}
        </button>
      </div>
    </div>
  );
}
